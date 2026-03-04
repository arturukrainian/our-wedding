# our-wedding
Wedding invitation website – 26 June 2026

## RSVP -> Telegram

The RSVP form can send submissions to your Telegram bot through a webhook endpoint.

### 1) Set endpoint in HTML

In `index.html`, configure the form attribute:

```html
<form id="rsvpForm" data-telegram-endpoint="https://your-endpoint.example.com/rsvp-telegram">
```

### 2) Endpoint behavior

Your endpoint must accept `POST application/json` with payload:

```json
{
  "name": "Guest Name",
  "adults": 2,
  "kids": 1,
  "drinks": ["champagne", "wine"],
  "submittedAt": "2026-03-04T12:00:00.000Z"
}
```

Then forward this payload to Telegram Bot API (`sendMessage`) using server-side token/chat ID.

### 3) Important

Do not put Telegram bot token directly in frontend code.
Keep token and chat ID only on server/webhook side.
