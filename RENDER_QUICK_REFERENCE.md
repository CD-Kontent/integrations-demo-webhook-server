# 🚀 Render Deployment - Quick Reference

## ⚡ **5-Minute Deployment from Webhook Server Folder**

### **1. Push to GitHub**
```bash
# Make sure you're in the Webhook Server folder
cd "Webhook Server"
git add .
git commit -m "Deploy to Render"
git push origin main
```

### **2. Create Render Service**
- Go to [render.com](https://render.com) → **"New +"** → **"Web Service"**
- Connect GitHub repo → Select your repository
- Render auto-detects your `render.yaml` configuration

### **3. Set Environment Variables**
In Render dashboard → **Environment** tab:
```
WEBHOOK_SECRET = your-kontent-webhook-secret
```

### **4. Deploy**
Click **"Create Web Service"** → Wait 2-5 minutes

### **5. Update Kontent.ai**
- Go to Kontent.ai → **Webhooks** → Edit your webhook
- Set URL to: `https://your-service-name.onrender.com/webhook`

## 🔗 **Your Webhook URL**
```
https://your-service-name.onrender.com/webhook
```

## ✅ **Health Check URLs**
- **Status**: `https://your-service-name.onrender.com/`
- **Health**: `https://your-service-name.onrender.com/health`

## 🚨 **Troubleshooting**

| Issue | Solution |
|-------|----------|
| Build fails | Check `package.json` dependencies |
| Won't start | Set `WEBHOOK_SECRET` environment variable |
| Health check fails | Verify `/health` endpoint exists |
| Webhooks not received | Check Kontent.ai webhook URL |

## 📞 **Need Help?**
- **Render Docs**: [docs.render.com](https://docs.render.com)
- **Full Guide**: See `RENDER_DEPLOYMENT.md`
- **Project Structure**: Ensure all files are in "Webhook Server" folder

---
**🎯 You're deploying a production-ready webhook server with:**
- ✅ Automatic HTTPS
- ✅ Rate limiting
- ✅ Security headers
- ✅ Health monitoring
- ✅ Structured logging

**📁 Important**: Make sure your GitHub repository contains the "Webhook Server" folder with all the necessary files!
