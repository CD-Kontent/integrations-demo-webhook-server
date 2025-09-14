const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { signatureHelper } = require('@kontent-ai/webhook-helper');

const app = express();
const PORT = process.env.PORT || 3000;

// Webhook secret key from Kontent.ai
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret-here';

// Sender.net API configuration
const SENDER_API_URL = 'https://api.sender.net/v2/campaigns/aQ9DJ9/send';
const SENDER_API_KEY = process.env.SENDER_API_KEY || 'your-sender-api-key-here';

// Use raw body parser for signature validation
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));

// Parse JSON for other routes
app.use(bodyParser.json());

// Function to send data to Sender.net API
async function sendToSenderNet(webhookData) {
  try {
    const response = await axios.post(SENDER_API_URL, {
      webhook_data: webhookData,
      timestamp: new Date().toISOString(),
      source: 'kontent-webhook'
    }, {
      headers: {
        'Authorization': `Bearer ${SENDER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('✅ Successfully sent to Sender.net:', response.status);
    return { success: true, response: response.data };
  } catch (error) {
    console.error('❌ Failed to send to Sender.net:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return { success: false, error: error.message };
  }
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Kontent.ai Webhook Server is running!',
    webhookEndpoint: '/webhook',
    instructions: 'Send POST requests to /webhook to receive webhook notifications'
  });
});

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  console.log('Webhook received');
  
  try {
    // Get the signature header
    const signature = req.headers['x-kontent-ai-signature'];
    
    if (!signature) {
      console.log('Warning: No signature header found');
      return res.status(400).json({ error: 'Missing signature header' });
    }
    
    // Validate the webhook signature
    const isValid = signatureHelper.isValidSignatureFromString(
      req.body,
      WEBHOOK_SECRET,
      signature
    );
    
    if (!isValid) {
      console.log('❌ Webhook signature validation failed');
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }
    
    console.log('✅ Webhook signature validated successfully');
    
    // Parse the webhook payload
    const payload = JSON.parse(req.body.toString());
    
    // Send to Sender.net API
    const senderResult = await sendToSenderNet(payload);
    
    if (!senderResult.success) {
      console.error('Failed to send to Sender.net, but webhook was valid');
      // Still return success to Kontent.ai to avoid retries
    }
    
    // Send success response
    res.status(200).json({ 
      message: 'Webhook received and processed successfully',
      timestamp: new Date().toISOString(),
      sender_net_sent: senderResult.success
    });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(400).json({ 
      error: 'Failed to process webhook',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Webhook server is running on port ${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`🔑 Make sure to set WEBHOOK_SECRET environment variable with your webhook secret`);
  console.log(`📧 Sender.net integration enabled - make sure to set SENDER_API_KEY environment variable`);
  console.log(`📖 Health check: http://localhost:${PORT}/`);
});
