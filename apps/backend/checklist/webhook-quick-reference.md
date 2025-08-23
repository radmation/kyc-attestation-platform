# iDenfy Webhook Quick Reference

## 🔑 **Essential Configuration**

### **Webhook Secret (Use for ALL webhooks)**
```
719d19af4f57508df8e0eaab21bf4a5f5cb61e0bf50282cec5514bf36501c4e2
```

### **OAuth Configuration**
- ❌ **DO NOT Enable OAuth** for webhooks
- ✅ **Use Webhook Signatures** instead (more secure and simpler)

### **Headers Configuration**
- **Leave headers as default** - iDenfy will set required headers automatically
- **Don't add custom headers** unless specifically required by your system

---

## 🌐 **Webhook URLs**

### **Development (Local)**
```
http://localhost:3000/api/kyc/webhook/idenfy
http://localhost:3000/api/aml/webhook/idenfy
http://localhost:3000/api/documents/webhook/idenfy
```

### **Production (Replace with your domain)**
```
https://yourdomain.com/api/kyc/webhook/idenfy
https://yourdomain.com/api/aml/webhook/idenfy
https://yourdomain.com/api/documents/webhook/idenfy
```

---

## ⚙️ **iDenfy Dashboard Settings**

### **For Each Webhook:**
1. **Name**: Descriptive name (e.g., "KYC Verification Webhook")
2. **URL**: Your webhook endpoint
3. **Signing Key**: `719d19af4f57508df8e0eaab21bf4a5f5cb61e0bf50282cec5514bf36501c4e2`
4. **HTTP Method**: POST
5. **OAuth**: ❌ **Disabled**
6. **Headers**: Default (don't modify)

---

## 🚨 **Security Notes**

- **One signing key** works for all webhook types
- **Never share** the webhook secret
- **Webhook signatures** provide better security than OAuth for webhooks
- **Test webhooks** before going live

---

## 📞 **Need Help?**

- **Full Checklist**: See `idenfy-webhook-setup.md`
- **Integration Guide**: See `/docs/IDENFY_INTEGRATION_GUIDE.md`
- **Task Details**: See `tasks/01-identity-attestation/phase-1-verification/todo/P0-ATT-001-idenfy-kyc-integration.md` 