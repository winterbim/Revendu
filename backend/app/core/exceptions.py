"""
Custom exception classes for Revendu.

All exceptions inherit from a base class with a detail message that will be
sent to the client in JSON responses via the global exception handler.
"""


class RevenduException(Exception):
    """Base exception for all Revendu errors."""

    def __init__(self, detail: str, status_code: int = 400):
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)


class NotFoundError(RevenduException):
    """Resource not found (404)."""

    def __init__(self, detail: str = "Ressource introuvable."):
        super().__init__(detail, status_code=404)


class ForbiddenError(RevenduException):
    """Access denied — user lacks permission (403)."""

    def __init__(self, detail: str = "Accès refusé."):
        super().__init__(detail, status_code=403)


class ValidationError(RevenduException):
    """Validation error (422)."""

    def __init__(self, detail: str = "Données invalides."):
        super().__init__(detail, status_code=422)


class ConflictError(RevenduException):
    """Resource conflict, typically duplicate key (409)."""

    def __init__(self, detail: str = "Conflit : ressource existante."):
        super().__init__(detail, status_code=409)


class UnauthorizedError(RevenduException):
    """Authentication failed (401)."""

    def __init__(self, detail: str = "Authentification requise."):
        super().__init__(detail, status_code=401)


class PlanLimitError(RevenduException):
    """Plan limit exceeded (402)."""

    def __init__(self, detail: str = "Limite d'utilisation atteinte."):
        super().__init__(detail, status_code=402)


class BusinessLogicError(RevenduException):
    """Domain/business logic violation (400)."""

    def __init__(self, detail: str = "Opération non permise."):
        super().__init__(detail, status_code=400)
