const express = require('express');
const bodyParser = require('body-parser');
const { signatureHelper } = require('@kontent-ai/webhook-helper');

const app = express();
const PORT = process.env.PORT || 3000;

// Webhook secret key from Kontent.ai (you'll need to set this)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret-here';

// Use raw body parser for signature validation
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));

// Parse JSON for other routes
app.use(bodyParser.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Kontent.ai Webhook Server is running!',
    webhookEndpoint: '/webhook',
    instructions: 'Send POST requests to /webhook to receive webhook notifications'
  });
});

// Webhook endpoint
app.post('/webhook', (req, res) => {
  console.log('Webhook received');
  
  try {
    // Get the signature header
    const signature = req.headers['x-kontent-ai-signature'];
    
    if (!signature) {
      console.log('Warning: No signature header found');
      console.log('Headers received:', req.headers);
    } else {
      // Validate the webhook signature
      const isValid = signatureHelper.isValidSignatureFromString(
        req.body,
        WEBHOOK_SECRET,
        signature
      );
      
      if (isValid) {
        console.log('✅ Webhook signature validated successfully');
      } else {
        console.log('❌ Webhook signature validation failed');
      }
    }
    
    // Parse and log the webhook payload
    const payload = JSON.parse(req.body.toString());
    console.log('Webhook payload:');
    console.log(JSON.stringify(payload, null, 2));
    
    // Log specific details about the notification
    if (payload.notifications && payload.notifications.length > 0) {
      const notification = payload.notifications[0];
      console.log('\n📋 Notification Summary:');
      console.log(`Object Type: ${notification.message?.object_type}`);
      console.log(`Action: ${notification.message?.action}`);
      console.log(`Delivery Slot: ${notification.message?.delivery_slot}`);
      
      if (notification.data?.system) {
        const system = notification.data.system;
        console.log(`Object Name: ${system.name}`);
        console.log(`Object Codename: ${system.codename}`);
        console.log(`Last Modified: ${system.last_modified}`);
      }
    }
    
    // Send success response
    res.status(200).json({ 
      message: 'Webhook received successfully',
      timestamp: new Date().toISOString()
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
  console.log(`📖 Health check: http://localhost:${PORT}/`);
});
