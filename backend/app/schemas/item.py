import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


Platform = Literal["vinted", "leboncoin", "ebay", "vestiaire", "autres"]
ItemStatus = Literal["unsold", "sold"]


class ItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=500)
    description: str | None = Field(default=None, max_length=2000)
    platform: Platform = "autres"
    purchase_price: Decimal = Field(ge=Decimal("0.00"), decimal_places=2)
    purchase_date: date
    # Allow creating an item already sold
    sale_price: Decimal | None = Field(default=None, ge=Decimal("0.00"), decimal_places=2)
    sale_date: date | None = None
    platform_fees: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"), decimal_places=2)
    shipping_cost: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"), decimal_places=2)

    @model_validator(mode="after")
    def sale_fields_consistent(self) -> "ItemCreate":
        if self.sale_price is not None and self.sale_date is None:
            raise ValueError("sale_date est requis quand sale_price est fourni.")
        if self.sale_date is not None and self.sale_price is None:
            raise ValueError("sale_price est requis quand sale_date est fourni.")
        return self


class ItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = Field(default=None, max_length=2000)
    platform: Platform | None = None
    purchase_price: Decimal | None = Field(default=None, ge=Decimal("0.00"), decimal_places=2)
    purchase_date: date | None = None
    platform_fees: Decimal | None = Field(default=None, ge=Decimal("0.00"), decimal_places=2)
    shipping_cost: Decimal | None = Field(default=None, ge=Decimal("0.00"), decimal_places=2)


class MarkSoldRequest(BaseModel):
    sale_price: Decimal = Field(ge=Decimal("0.00"), decimal_places=2)
    sale_date: date
    platform_fees: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"), decimal_places=2)
    shipping_cost: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"), decimal_places=2)

    @field_validator("sale_price")
    @classmethod
    def sale_price_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Le prix de vente doit être supérieur à 0.")
        return v


class ItemOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    description: str | None
    platform: Platform
    status: ItemStatus
    purchase_price: Decimal
    purchase_date: date
    sale_price: Decimal | None
    sale_date: date | None
    platform_fees: Decimal
    shipping_cost: Decimal
    # Computed
    gross_receipt: Decimal | None
    net_profit: Decimal | None
    created_at: datetime
    updated_at: datetime
