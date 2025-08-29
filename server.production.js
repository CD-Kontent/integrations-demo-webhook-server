const express = require('express');
const bodyParser = require('body-parser');
const { signatureHelper } = require('@kontent-ai/webhook-helper');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Webhook secret key from Kontent.ai (REQUIRED in production)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
if (!WEBHOOK_SECRET) {
  console.error('❌ WEBHOOK_SECRET environment variable is required in production!');
  process.exit(1);
}

// Security middleware
app.use(helmet());

// Rate limiting for webhook endpoint
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many webhook requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/webhook', webhookLimiter);

// Logging middleware
app.use(morgan('combined'));

// Use raw body parser for signature validation
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));

// Parse JSON for other routes
app.use(bodyParser.json());

// Health check endpoint with detailed status
app.get('/', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({ 
    status: 'healthy',
    message: 'Kontent.ai Webhook Server is running!',
    webhookEndpoint: '/webhook',
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Detailed health check for monitoring systems
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Webhook endpoint
app.post('/webhook', (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Webhook received from ${req.ip}`);
  
  try {
    // Get the signature header
    const signature = req.headers['x-kontent-ai-signature'];
    
    if (!signature) {
      console.log(`[${new Date().toISOString()}] Warning: No signature header found from ${req.ip}`);
      console.log(`[${new Date().toISOString()}] Headers received:`, req.headers);
      
      // In production, you might want to reject unsigned requests
      if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Missing webhook signature'
        });
      }
    } else {
      // Validate the webhook signature
      const isValid = signatureHelper.isValidSignatureFromString(
        req.body,
        WEBHOOK_SECRET,
        signature
      );
      
      if (isValid) {
        console.log(`[${new Date().toISOString()}] ✅ Webhook signature validated successfully`);
      } else {
        console.log(`[${new Date().toISOString()}] ❌ Webhook signature validation failed from ${req.ip}`);
        
        // In production, reject invalid signatures
        if (process.env.NODE_ENV === 'production') {
          return res.status(401).json({ 
            error: 'Unauthorized',
            message: 'Invalid webhook signature'
          });
        }
      }
    }
    
    // Parse and log the webhook payload
    const payload = JSON.parse(req.body.toString());
    console.log(`[${new Date().toISOString()}] Webhook payload:`, JSON.stringify(payload, null, 2));
    
    // Log specific details about the notification
    if (payload.notifications && payload.notifications.length > 0) {
      const notification = payload.notifications[0];
      console.log(`[${new Date().toISOString()}] 📋 Notification Summary:`);
      console.log(`[${new Date().toISOString()}]   Object Type: ${notification.message?.object_type}`);
      console.log(`[${new Date().toISOString()}]   Action: ${notification.message?.action}`);
      console.log(`[${new Date().toISOString()}]   Delivery Slot: ${notification.message?.delivery_slot}`);
      
      if (notification.data?.system) {
        const system = notification.data.system;
        console.log(`[${new Date().toISOString()}]   Object Name: ${system.name}`);
        console.log(`[${new Date().toISOString()}]   Object Codename: ${system.codename}`);
        console.log(`[${new Date().toISOString()}]   Last Modified: ${system.last_modified}`);
      }
    }
    
    const processingTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Webhook processed in ${processingTime}ms`);
    
    // Send success response
    res.status(200).json({ 
      message: 'Webhook received successfully',
      timestamp: new Date().toISOString(),
      processingTime: `${processingTime}ms`
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Error processing webhook from ${req.ip}:`, error);
    console.error(`[${new Date().toISOString()}] Processing time: ${processingTime}ms`);
    
    res.status(400).json({ 
      error: 'Failed to process webhook',
      message: error.message,
      processingTime: `${processingTime}ms`
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: ['/', '/health', '/webhook']
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Server error:`, err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Production webhook server is running on port ${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`🔑 Webhook secret is configured`);
  console.log(`📖 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});
