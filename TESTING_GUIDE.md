# Revendu — Plan Gating Testing Guide

## Quick Start

### Backend Testing

#### 1. Test Stripe Webhook (Pro Activation)

```bash
curl -X POST http://localhost:8000/api/v1/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "customer": "cus_XXXXX",
        "client_reference_id": "UUID-HERE"
      }
    }
  }'
```

Expected: User's `plan` field set to "pro" in database.

#### 2. Test Item Limit (Free Users)

**Create 50 items as free user:**
```bash
# First 50 items: ✅ Success (201 Created)
curl -X POST http://localhost:8000/api/v1/items \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Item 1",
    "platform": "vinted",
    "purchase_price": 20.00,
    "purchase_date": "2024-01-01"
  }'

# Item 51: ❌ Failed (402 Payment Required)
# Response: "Limite atteinte (50 articles maximum en plan gratuit).
#            Passez à Revendu Pro pour ajouter plus d'articles."
```

#### 3. Test Pro-Only Features

**Attempt PDF export as free user:**
```bash
curl -X GET http://localhost:8000/api/v1/export/pdf?year=2024 \
  -H "Authorization: Bearer FREE_USER_TOKEN"

# Response: 403 Forbidden
# "Cette fonctionnalité est réservée aux utilisateurs Revendu Pro.
#  Passez à la version Pro pour y accéder."
```

**Same request as pro user:**
```bash
curl -X GET http://localhost:8000/api/v1/export/pdf?year=2024 \
  -H "Authorization: Bearer PRO_USER_TOKEN"

# Response: 200 OK with PDF file
```

#### 4. Test Gmail Sync (Pro Only)

```bash
# Free user attempts authorization
curl -X GET http://localhost:8000/api/v1/sync/gmail/authorize \
  -H "Authorization: Bearer FREE_USER_TOKEN"

# Response: 403 Forbidden
```

### Frontend Testing

#### 1. Test Sidebar Plan Badge

- Log in as pro user → See "Pro" badge next to name
- Log in as free user → See "Passer à Pro" highlighted link

#### 2. Test Dashboard Upgrade Banner

- Log in as free user → See upgrade banner with features listed
- Log in as pro user → No upgrade banner shown

#### 3. Test Feature Overlays

- Log in as free user on dashboard → See lock icons on:
  - Platform breakdown chart
  - Sankey financial flow chart
- Log in as pro user → Charts fully visible without overlays

#### 4. Test User Info Endpoint

```bash
# Get current user info
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer ACCESS_TOKEN"

# Response includes plan field:
{
  "id": "uuid...",
  "email": "user@example.com",
  "full_name": "John Doe",
  "fiscal_year": 2024,
  "plan": "free",  // or "pro"
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-03-23T12:00:00Z",
  "gmail_connected": false,
  "last_email_sync": null
}
```

#### 5. Test Stats Endpoint

```bash
curl http://localhost:8000/api/v1/dashboard/stats \
  -H "Authorization: Bearer ACCESS_TOKEN"

# Response includes is_pro flag and platform_breakdown handling:
{
  "year": 2024,
  "total_sold_items": 5,
  "gross_receipts": 1500.00,
  "total_profit": 300.00,
  "avg_profit_per_item": 60.00,
  "best_platform": "vinted",
  "platform_breakdown": [],  // Empty for free users!
  "threshold_transactions": {...},
  "threshold_receipts": {...},
  "alert_level": "safe",
  "is_pro": false
}
```

## Webhook Testing with Stripe CLI

### Setup

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS

# Login
stripe login

# Forward webhooks to local backend
stripe listen --forward-to http://localhost:8000/api/v1/payments/webhook
```

### Simulate Events

```bash
# Simulate checkout completion (activate pro)
stripe trigger checkout.session.completed

# Simulate subscription deletion (downgrade to free)
stripe trigger customer.subscription.deleted

# Simulate subscription update
stripe trigger customer.subscription.updated

# Simulate payment failure
stripe trigger invoice.payment_failed
```

## Database State Verification

### Check User Plan Status

```sql
SELECT id, email, plan, stripe_customer_id FROM users WHERE email = 'test@example.com';
```

Expected output after webhook:
```
                   id                   |      email       | plan |   stripe_customer_id
----------------------------------------+------------------+------+---------------------
 12345678-1234-1234-1234-123456789012   | test@example.com | pro  | cus_XXXXXXXXXXXXX
```

### Check Item Count

```sql
SELECT user_id, COUNT(*) as item_count FROM items
WHERE user_id = '12345678-1234-1234-1234-123456789012'
GROUP BY user_id;
```

## Edge Cases to Test

1. **User at exactly 50 items (free):**
   - Try to create item 51 → Should fail with 402
   - Upgrade to pro → Should now succeed

2. **Concurrent requests:**
   - Multiple item creation requests near limit
   - Should enforce limit atomically

3. **Plan downgrade mid-session:**
   - User is pro, creates 100 items
   - Subscription expires → plan = "free"
   - Old items still exist (no purge)
   - Can't create new items beyond 50 total

4. **Webhook retry:**
   - Send same event twice
   - Should be idempotent (same result)

5. **Invalid webhook signature:**
   - Send webhook without proper signature
   - Should fail gracefully (400 Bad Request)

## Performance Notes

- `count_items()` uses `func.count()` for efficiency
- No N+1 queries in item limit check
- Webhook processing uses async/await for non-blocking I/O
- Frontend API calls reuse existing auth infrastructure

---

**All tests passing? ✅ Ready to deploy!**
