# Deployment Guide

This guide covers the changes needed to deploy your Kontent.ai webhook server to production.

## 🚀 Pre-Deployment Changes

### 1. **Install Production Dependencies**

```bash
npm install
```

The production server now includes:
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `morgan` - HTTP request logging

### 2. **Environment Variables**

Create a `.env` file with your production values:

```bash
# Required
WEBHOOK_SECRET=your-actual-kontent-webhook-secret

# Optional
NODE_ENV=production
PORT=3000
```

**⚠️ Important:** Never commit your `.env` file to version control!

### 3. **Update Kontent.ai Webhook URL**

In Kontent.ai, update your webhook URL to point to your production domain:
- Go to **Environment settings** > **Webhooks**
- Update the **Webhook URL** to: `https://yourdomain.com/webhook`

## 🌐 Deployment Options

### Option 1: Heroku

1. **Install Heroku CLI** and login:
   ```bash
   heroku login
   ```

2. **Create a new Heroku app**:
   ```bash
   heroku create your-webhook-app-name
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set WEBHOOK_SECRET=your-actual-secret
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push heroku main
   ```

5. **Open your app**:
   ```bash
   heroku open
   ```

### Option 2: Railway

1. **Connect your GitHub repository** to Railway
2. **Set environment variables** in Railway dashboard:
   - `WEBHOOK_SECRET`
   - `NODE_ENV=production`
3. **Deploy automatically** on git push

### Option 3: DigitalOcean App Platform

1. **Create a new app** in DigitalOcean
2. **Connect your GitHub repository**
3. **Set environment variables**:
   - `WEBHOOK_SECRET`
   - `NODE_ENV=production`
4. **Deploy**

### Option 4: Docker Deployment

1. **Build the Docker image**:
   ```bash
   docker build -t webhook-server .
   ```

2. **Run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

3. **Or run standalone**:
   ```bash
   docker run -d \
     -p 3000:3000 \
     -e WEBHOOK_SECRET=your-secret \
     -e NODE_ENV=production \
     --name webhook-server \
     webhook-server
   ```

### Option 5: VPS/Server Deployment

1. **SSH into your server**
2. **Clone your repository**
3. **Install Node.js and npm**
4. **Set environment variables**
5. **Use PM2 for process management**:
   ```bash
   npm install -g pm2
   pm2 start server.production.js --name "webhook-server"
   pm2 startup
   pm2 save
   ```

## 🔒 Security Considerations

### 1. **HTTPS/SSL**
- **Heroku/Railway**: Automatically provides HTTPS
- **Custom domain**: Install SSL certificate (Let's Encrypt)
- **VPS**: Configure Nginx/Apache with SSL

### 2. **Firewall Configuration**
Allow only necessary ports:
```bash
# UFW (Ubuntu)
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP (redirect to HTTPS)
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 3. **Environment Variables**
- Never expose `WEBHOOK_SECRET` in logs or responses
- Use your hosting platform's secure environment variable storage
- Rotate secrets regularly

### 4. **Rate Limiting**
The production server includes rate limiting:
- 100 requests per 15 minutes per IP
- Adjust these values in `server.production.js` if needed

## 📊 Monitoring & Health Checks

### 1. **Health Check Endpoints**
- `/` - Basic status with memory usage
- `/health` - Simple health check for monitoring systems

### 2. **Logging**
- All requests are logged with timestamps
- Webhook processing times are measured
- Errors include IP addresses and processing times

### 3. **External Monitoring**
Set up monitoring for:
- **Uptime**: Pingdom, UptimeRobot
- **Performance**: New Relic, DataDog
- **Logs**: Papertrail, Loggly

## 🔄 Post-Deployment Steps

### 1. **Test Your Webhook**
```bash
# Test with your test script (update the URL)
node test-webhook.js
```

### 2. **Verify in Kontent.ai**
- Check webhook delivery status
- Monitor for any delivery failures
- Verify signature validation is working

### 3. **Set Up Alerts**
- Monitor webhook failures
- Set up notifications for server downtime
- Track webhook processing times

## 🚨 Troubleshooting

### Common Issues:

1. **"Webhook signature validation failed"**
   - Check `WEBHOOK_SECRET` environment variable
   - Verify the secret matches Kontent.ai

2. **"Port already in use"**
   - Change `PORT` environment variable
   - Check for other services using the port

3. **"Cannot bind to port"**
   - Ensure you have permission to bind to the port
   - Check firewall settings

4. **Webhooks not reaching your server**
   - Verify your server is accessible from the internet
   - Check firewall and security group settings
   - Ensure HTTPS is properly configured

## 📝 Production Checklist

- [ ] `WEBHOOK_SECRET` environment variable set
- [ ] `NODE_ENV=production` set
- [ ] HTTPS/SSL configured
- [ ] Firewall rules configured
- [ ] Monitoring set up
- [ ] Logs being collected
- [ ] Health checks working
- [ ] Webhook URL updated in Kontent.ai
- [ ] Test webhook delivery
- [ ] Backup strategy in place

## 🔧 Maintenance

### Regular Tasks:
- Monitor logs for errors
- Check webhook delivery success rates
- Update dependencies regularly
- Review and rotate secrets
- Monitor server resources

### Updates:
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Restart the service
# For PM2: pm2 restart webhook-server
# For Docker: docker-compose restart
# For Heroku: git push heroku main
```

## 📚 Additional Resources

- [Kontent.ai Webhook Documentation](https://kontent.ai/learn/docs/webhooks/webhooks/typescript)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practices-security.html)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
