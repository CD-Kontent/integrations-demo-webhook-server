# Kontent.ai Webhook Server

A simple Node.js webhook server for receiving and processing webhook notifications from Kontent.ai.

## Features

- ✅ Receives webhook notifications from Kontent.ai
- ✅ Validates webhook signatures for security
- ✅ Logs webhook payloads to console
- ✅ Provides detailed notification summaries
- ✅ Health check endpoint
- ✅ Error handling and logging

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

### Environment Variables

Set the following environment variable with your Kontent.ai webhook secret:

```bash
# Windows PowerShell
$env:WEBHOOK_SECRET="your-actual-webhook-secret"

# Windows Command Prompt
set WEBHOOK_SECRET=your-actual-webhook-secret

# Linux/Mac
export WEBHOOK_SECRET="your-actual-webhook-secret"
```

You can find your webhook secret in Kontent.ai:
1. Go to **Environment settings** > **Webhooks**
2. Click on your webhook
3. Go to **Settings** > **Secret**

### Port Configuration

The server runs on port 3000 by default. You can change this by setting the `PORT` environment variable:

```bash
$env:PORT=8080  # Windows PowerShell
```

## Usage

### Start the server

```bash
# Production
npm start

# Development (with auto-restart)
npm run dev
```

The server will start and display:
- Server status and port
- Webhook endpoint URL
- Health check URL
- Reminder about setting the webhook secret

### Webhook Endpoint

- **URL**: `http://localhost:3000/webhook`
- **Method**: POST
- **Content-Type**: `application/json`

### Health Check

- **URL**: `http://localhost:3000/`
- **Method**: GET

## Testing

### Test with cURL

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -H "X-Kontent-ai-Signature: test-signature" \
  -d '{
    "notifications": [
      {
        "data": {
          "system": {
            "id": "test-id",
            "name": "Test Item",
            "codename": "test_item",
            "type": "article",
            "last_modified": "2024-01-01T00:00:00Z"
          }
        },
        "message": {
          "object_type": "content_item",
          "action": "published",
          "delivery_slot": "published"
        }
      }
    ]
  }'
```

### Test with Postman

1. Create a new POST request to `http://localhost:3000/webhook`
2. Add header: `X-Kontent-ai-Signature: test-signature`
3. Set body to raw JSON with the test payload above
4. Send the request

## Setting up in Kontent.ai

1. In Kontent.ai, go to **Environment settings** > **Webhooks**
2. Click **Create new webhook**
3. Set **Webhook name** (e.g., "Local Development")
4. Set **Webhook URL** to your server's webhook endpoint
5. Configure triggers and events as needed
6. Save the webhook
7. Copy the **Secret** and set it as your `WEBHOOK_SECRET` environment variable

## Console Output

When a webhook is received, you'll see:

```
Webhook received
✅ Webhook signature validated successfully
Webhook payload:
{
  "notifications": [...]
}

📋 Notification Summary:
Object Type: content_item
Action: published
Delivery Slot: published
Object Name: Test Item
Object Codename: test_item
Last Modified: 2024-01-01T00:00:00Z
```

## Security Notes

- Always validate webhook signatures in production
- Keep your webhook secret secure
- Consider using HTTPS in production
- The server validates signatures using the official Kontent.ai webhook helper

## Troubleshooting

### "No signature header found"
- Make sure you're sending the `X-Kontent-ai-Signature` header
- Check that your webhook is properly configured in Kontent.ai

### "Webhook signature validation failed"
- Verify your `WEBHOOK_SECRET` environment variable is correct
- Ensure you're using the raw request body for signature validation

### Port already in use
- Change the port using the `PORT` environment variable
- Or stop other services using port 3000

## License

MIT
