# 🎉 SEPARATED BACKEND & FRONTEND - SETUP COMPLETE!

## ✅ What I Created

You now have a **completely separate** backend and frontend architecture!

---

## 📁 Folder Structure

### 1. **Frontend** (`mind_haven/my-app/`)

- **Technology:** Next.js 15 + React 19 + TypeScript
- **Port:** 3000
- **Purpose:** User interface only

### 2. **Backend** (`mind_haven_backend/`)

- **Technology:** Express.js + MongoDB + JavaScript
- **Port:** 5000
- **Purpose:** API server with authentication

---

## 🚀 How to Run

### Start Backend (Port 5000)

```bash
cd mind_haven_backend
npm run dev
```

**Backend will run on:** http://localhost:5000

### Start Frontend (Port 3000)

```bash
cd mind_haven/my-app
npm run dev
```

**Frontend will run on:** http://localhost:3000

---

## 🗂️ Backend Structure (JavaScript)

```
mind_haven_backend/
├── server.js                 # ✅ Main Express server
├── .env                      # ✅ MongoDB credentials
├── package.json             # ✅ All dependencies
└── src/
    ├── config/
    │   └── database.js      # ✅ MongoDB connection
    ├── models/
    │   ├── User.js          # ✅ User model (JS)
    │   └── Doctor.js        # ✅ Doctor model (JS)
    ├── middleware/
    │   └── auth.js          # ✅ JWT authentication
    ├── routes/
    │   ├── auth.js          # ✅ Login/Signup routes
    │   └── doctors.js       # ✅ Doctor management
    └── utils/
        └── jwt.js           # ✅ JWT utilities
```

---

## 📍 API Endpoints (Backend - Port 5000)

### Authentication

- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Doctors

- `GET /api/doctors` - List all doctors
- `GET /api/doctors/:id` - Get single doctor
- `GET /api/doctors/profile` - Get own profile (Doctor only)
- `PUT /api/doctors/profile` - Update profile (Doctor only)

### Test

- `GET /api/test` - Test API is running ✅ **WORKING!**
- `GET /api/health` - Health check

---

## 🧪 Test Your Backend

### 1. Test Server

```bash
curl http://localhost:5000/api/test
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Mind Haven Backend API is running!",
  "timestamp": "2026-01-29T..."
}
```

### 2. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\",\"userType\":\"user\"}"
```

### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

---

## 🔗 Frontend Integration

The frontend API service (`mind_haven/my-app/src/services/api.ts`) is **already configured** to point to:

```javascript
const API_BASE_URL = "http://localhost:5000";
```

### Example Usage in Frontend:

```typescript
import ApiService from "@/services/api";

// Login
const result = await ApiService.login({
  email: "test@example.com",
  password: "password123",
});

// Signup
const result = await ApiService.signup({
  email: "user@example.com",
  password: "pass123",
  name: "John Doe",
  userType: "user",
});

// Get current user
const user = await ApiService.getCurrentUser();
```

---

## ⚙️ Environment Variables

### Backend (`.env` in `mind_haven_backend/`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://dulanjanassd_db_user:DR34KJpVUzN0QvYd@cluster0.txkquae.mongodb.net/mind_haven
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2026
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

✅ **Already configured!**

---

## 🔐 Database

**MongoDB Atlas:**

- Database: `mind_haven`
- Collections: `users`, `doctors`
- Status: ✅ **Connected!**

---

## 📦 What Each Folder Contains

### `mind_haven_backend/` - Backend (Express.js)

✅ All JavaScript files (.js)
✅ Express server on port 5000
✅ MongoDB models
✅ JWT authentication
✅ API routes
✅ Separate from frontend

### `mind_haven/my-app/` - Frontend (Next.js)

✅ React components
✅ TypeScript files
✅ API service (points to backend at :5000)
✅ UI pages
✅ No database code
✅ Only frontend logic

---

## 🎯 Key Differences from Before

### ❌ Before (Integrated):

- Backend API inside Next.js (`/api` routes)
- Everything in one folder
- TypeScript for both frontend and backend

### ✅ Now (Separated):

- **Backend:** Separate Express.js server (JavaScript)
- **Frontend:** Next.js for UI only
- **Two different ports:** 5000 (backend) and 3000 (frontend)
- **Clear separation of concerns**

---

## 🛠️ Development Workflow

### 1. Start Backend First

```bash
cd mind_haven_backend
npm run dev
```

✅ Backend running on http://localhost:5000

### 2. Then Start Frontend

```bash
cd mind_haven/my-app
npm run dev
```

✅ Frontend running on http://localhost:3000

### 3. Test Integration

- Frontend makes API calls to http://localhost:5000
- CORS is configured to allow requests from http://localhost:3000

---

## 📚 Documentation

### Backend Documentation:

- `mind_haven_backend/README.md` - Complete backend guide

### API Documentation:

- All endpoints documented in backend README
- Postman collection available

---

## ✨ Features

### Backend (Express.js):

✅ User authentication (signup/login)
✅ Password hashing (bcrypt)
✅ JWT tokens
✅ Protected routes
✅ Role-based access (user/doctor)
✅ Doctor profile management
✅ MongoDB integration
✅ CORS enabled
✅ Error handling

### Frontend (Next.js):

✅ API service configured
✅ Token management
✅ Type-safe TypeScript
✅ Ready for UI development

---

## 🎉 Status

### Backend: ✅ **RUNNING & TESTED!**

```
🚀 Server running on port 5000
✅ MongoDB Connected
```

### Frontend: ✅ **READY!**

```
API service configured properly
Points to http://localhost:5000
```

---

## 🚦 Quick Start Commands

```bash
# Terminal 1 - Backend
cd mind_haven_backend
npm run dev

# Terminal 2 - Frontend
cd mind_haven/my-app
npm run dev
```

---

## 🔍 What Was Changed

1. ✅ Created complete Express.js backend in `mind_haven_backend/`
2. ✅ All backend code in JavaScript (.js files)
3. ✅ Updated frontend API service to point to port 5000
4. ✅ Removed backend logic from Next.js (keeping it frontend-only)
5. ✅ Configured CORS for communication
6. ✅ Tested and verified working!

---

**Your separated backend and frontend architecture is complete and working! 🎉**

**Backend:** http://localhost:5000
**Frontend:** http://localhost:3000
