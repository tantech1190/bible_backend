# IntentionalStudy Backend - Quick Start

Get the backend API running in 5 minutes!

---

## 🚀 Super Quick Start

### 1. Install Dependencies (1 minute)

```bash
cd backend
npm install
```

### 2. Setup Environment (2 minutes)

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
nano .env
```

**Minimum required configuration:**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/intentionalstudy
JWT_SECRET=my_super_secret_jwt_key_change_in_production
```

### 3. Start MongoDB (1 minute)

**If MongoDB is not running:**

```bash
# Ubuntu/Debian
sudo systemctl start mongod

# macOS (with Homebrew)
brew services start mongodb-community

# Windows (run as admin)
net start MongoDB
```

**Verify MongoDB is running:**

```bash
mongosh
# Should connect successfully
```

### 4. Start the Server (1 minute)

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected Successfully
🚀 IntentionalStudy API Server running on port 5000
📚 Environment: development
```

### 5. Test the API (30 seconds)

Open your browser or use curl:

```bash
curl http://localhost:5000/api/health
```

You should see:
```json
{
  "success": true,
  "message": "IntentionalStudy API is running",
  "timestamp": "2024-12-17T...",
  "environment": "development"
}
```

---

## ✅ You're Ready!

Your backend API is now running at: **`http://localhost:5000/api`**

---

## 🧪 Next Steps - Test the APIs

### Option 1: Use the API Collection (Recommended)

1. **Install Postman or Thunder Client (VS Code extension)**

2. **Import the collection:**
   - File: `/backend/api-collection.json`
   - In Postman: File → Import → Select api-collection.json
   - In Thunder Client: Collections → Import → Select api-collection.json

3. **Set the baseUrl variable:**
   - Value: `http://localhost:5000/api`

4. **Test authentication:**
   - Run "Register" request to create a user
   - Run "Login" request to get a token
   - Copy the token from response
   - Set `authToken` variable
   - Try other requests!

### Option 2: Test with cURL

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "age": 17
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get devotionals (copy token from login response):**
```bash
curl -X GET http://localhost:5000/api/devotionals \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔧 Common Issues

### Issue: "Cannot connect to MongoDB"

**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# If not running, start it
sudo systemctl start mongod
```

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process (replace PID)
kill -9 PID

# Or change port in .env
PORT=5001
```

### Issue: "Module not found"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 What's Next?

1. **Read the Integration Guide:** `/INTEGRATION_GUIDE.md`
2. **Check the API Collection:** Test all 100+ endpoints
3. **Integrate with React Admin:** `/admin-app/services/`
4. **Integrate with Flutter App:** `/flutter/lib/services/`
5. **Follow the Checklist:** `/INTEGRATION_CHECKLIST.md`

---

## 🎯 Create Your First Content

Once you're logged in as admin, try creating:

**A Devotional:**
```bash
curl -X POST http://localhost:5000/api/devotionals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Finding Peace",
    "content": "In times of uncertainty...",
    "verse": "Philippians 4:6-7",
    "date": "2024-12-17",
    "status": "published",
    "category": "Peace"
  }'
```

**A Quest:**
```bash
curl -X POST http://localhost:5000/api/quests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Journey Through Genesis",
    "book": "Genesis",
    "chapters": "1-50",
    "description": "Explore creation and God covenant",
    "points": 500,
    "difficulty": "medium",
    "status": "active"
  }'
```

---

## 🎉 Success!

You now have a fully functional Bible app backend API running locally!

**API Base URL:** `http://localhost:5000/api`
**Health Check:** `http://localhost:5000/api/health`

Happy coding! 🚀
