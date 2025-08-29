# Render Deployment Guide

This guide walks you through deploying your Kontent.ai webhook server to Render from the "Webhook Server" folder.

## 🚀 **Why Render?**

- ✅ **Perfect for Node.js apps** - Native support
- ✅ **Automatic HTTPS** - Secure webhook delivery
- ✅ **Free tier available** - Generous limits
- ✅ **Easy deployment** - Connect GitHub, auto-deploy
- ✅ **Built-in monitoring** - Health checks and logs
- ✅ **Custom domains** - Use your own domain

## 📋 **Prerequisites**

1. **GitHub repository** with your webhook server code in the "Webhook Server" folder
2. **Render account** - Sign up at [render.com](https://render.com)
3. **Kontent.ai webhook secret** - From your Kontent.ai project

## 🔧 **Step-by-Step Deployment**

### **Step 1: Prepare Your Repository**

Ensure your "Webhook Server" folder contains these files:
- ✅ `package.json` with production dependencies
- ✅ `server.production.js` (production server)
- ✅ `render.yaml` (Render configuration)
- ✅ `.gitignore` (excludes sensitive files)

### **Step 2: Connect to Render**

1. **Login to Render** and click **"New +"**
2. **Select "Web Service"**
3. **Connect your GitHub repository**
4. **Choose the repository** containing your webhook server

### **Step 3: Configure Your Service**

Render will auto-detect your `render.yaml` configuration, but you can customize:

**Basic Settings:**
- **Name**: `kontent-webhook-server` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)

**Build & Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `npm run start:prod`
- **Plan**: `Free` (or upgrade if needed)

### **Step 4: Set Environment Variables**

**Required:**
- `WEBHOOK_SECRET` = Your Kontent.ai webhook secret

**Optional:**
- `NODE_ENV` = `production`
- `PORT` = `10000` (Render uses this port)

**How to set:**
1. In your service dashboard, go to **"Environment"** tab
2. Click **"Add Environment Variable"**
3. Add each variable with its value
4. Click **"Save Changes"**

### **Step 5: Deploy**

1. **Click "Create Web Service"**
2. **Wait for build** (usually 2-5 minutes)
3. **Check deployment status** in the logs
4. **Verify health check** passes

## 🌐 **Post-Deployment Setup**

### **1. Get Your Webhook URL**

Your webhook server will be available at:
```
https://your-service-name.onrender.com/webhook
```

### **2. Update Kontent.ai Webhook URL**

1. Go to **Kontent.ai** > **Environment settings** > **Webhooks**
2. **Edit your webhook**
3. **Update Webhook URL** to your Render URL
4. **Save changes**

### **3. Test Your Webhook**

Use your test script (update the URL):
```bash
# Update test-webhook.js with your Render URL
# Change localhost:3000 to your-service-name.onrender.com
node test-webhook.js
```

## 📊 **Monitoring & Health Checks**

### **Health Check Endpoints**
- **Main**: `https://your-service.onrender.com/`
- **Health**: `https://your-service.onrender.com/health`

### **Render Dashboard Features**
- **Real-time logs** - View server output
- **Deployment history** - Track changes
- **Health status** - Monitor uptime
- **Performance metrics** - CPU, memory usage

## 🔒 **Security Considerations**

### **Environment Variables**
- ✅ `WEBHOOK_SECRET` is secure in Render
- ✅ Never exposed in logs or responses
- ✅ Can be updated without redeployment

### **HTTPS**
- ✅ **Automatic** - Render provides SSL certificates
- ✅ **Always on** - No HTTP traffic allowed
- ✅ **Modern TLS** - Latest security standards

### **Rate Limiting**
- ✅ Built into your production server
- ✅ 100 requests per 15 minutes per IP
- ✅ Protects against abuse

## 🚨 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. Build Failures**
```
Error: Cannot find module '@kontent-ai/webhook-helper'
```
**Solution**: Ensure `package.json` has all dependencies and `render.yaml` build command is correct.

#### **2. Service Won't Start**
```
Error: WEBHOOK_SECRET environment variable is required in production!
```
**Solution**: Set the `WEBHOOK_SECRET` environment variable in Render dashboard.

#### **3. Health Check Fails**
```
Health check failed: 404 Not Found
```
**Solution**: Verify your `render.yaml` has `healthCheckPath: /health` and your server has the `/health` endpoint.

#### **4. Webhooks Not Reaching Server**
```
No webhook requests in logs
```
**Solutions**:
- Check Kontent.ai webhook URL is correct
- Verify service is running (green status in Render)
- Check webhook delivery status in Kontent.ai

#### **5. Memory/CPU Issues**
```
Service restarted due to resource limits
```
**Solutions**:
- Upgrade to paid plan for more resources
- Optimize your webhook processing
- Add request timeouts

### **Debug Commands**

**Check service status:**
```bash
# In Render dashboard > Logs
# Look for startup messages and any errors
```

**Test health endpoint:**
```bash
curl https://your-service.onrender.com/health
```

**Test webhook endpoint:**
```bash
curl -X POST https://your-service.onrender.com/webhook \
  -H "Content-Type: application/json" \
  -H "X-Kontent-ai-Signature: test" \
  -d '{"test": "data"}'
```

## 📈 **Scaling & Upgrades**

### **Free Plan Limitations**
- **Sleep after 15 minutes** of inactivity
- **512MB RAM** - Sufficient for webhooks
- **Shared CPU** - Good for moderate traffic
- **Custom domains** - Available

### **Upgrade Options**
- **Starter Plan** ($7/month): Always-on, 512MB RAM
- **Standard Plan** ($25/month): 1GB RAM, dedicated CPU
- **Pro Plan** ($50/month): 2GB RAM, auto-scaling

### **When to Upgrade**
- **High webhook volume** (>1000/day)
- **Complex processing** (heavy computations)
- **Always-on requirement** (no sleep)
- **Custom domain** needs

## 🔄 **Updates & Maintenance**

### **Automatic Updates**
- ✅ **Auto-deploy** on git push to main branch
- ✅ **Zero-downtime** deployments
- ✅ **Rollback** to previous versions

### **Manual Updates**
1. **Push changes** to your GitHub repository
2. **Monitor deployment** in Render dashboard
3. **Verify health check** passes
4. **Test webhook** functionality

### **Environment Variable Updates**
1. **Go to Environment tab** in service dashboard
2. **Update values** as needed
3. **Save changes** (no redeployment required)

## 📱 **Mobile & API Access**

### **Render API**
- **Manage services** programmatically
- **Automate deployments**
- **Monitor resources**

### **Mobile Dashboard**
- **View service status** on mobile
- **Check logs** and metrics
- **Manage deployments**

## 🎯 **Best Practices**

### **1. Environment Management**
- Use different branches for staging/production
- Test changes locally before pushing
- Monitor environment variable changes

### **2. Monitoring**
- Set up alerts for service failures
- Monitor webhook delivery success rates
- Track response times and errors

### **3. Security**
- Regularly rotate webhook secrets
- Monitor for suspicious activity
- Keep dependencies updated

### **4. Performance**
- Optimize webhook processing logic
- Add request timeouts
- Monitor memory usage

## 📞 **Support Resources**

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **Render Community**: [community.render.com](https://community.render.com)
- **Kontent.ai Support**: [kontent.ai/support](https://kontent.ai/support)

## 🎉 **You're All Set!**

Your webhook server is now running on Render with:
- ✅ **Automatic HTTPS**
- ✅ **Health monitoring**
- ✅ **Easy scaling**
- ✅ **Professional hosting**

The webhook URL to use in Kontent.ai is:
```
https://your-service-name.onrender.com/webhook
```

Happy webhook processing! 🚀
