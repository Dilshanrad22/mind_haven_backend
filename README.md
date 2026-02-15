# Mind Haven Backend API

**Separate Express.js Backend for Mind Haven Mental Wellness Platform**

## 🏗️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Language:** JavaScript (ES6+)

---

## 📁 Project Structure

```
mind_haven_backend/
├── server.js                 # Main server file
├── .env                      # Environment variables
├── package.json             # Dependencies
└── src/
    ├── config/
    │   └── database.js      # MongoDB connection
    ├── models/
    │   ├── User.js          # User model
    │   └── Doctor.js        # Doctor model
    ├── middleware/
    │   └── auth.js          # Authentication middleware
    ├── routes/
    │   ├── auth.js          # Authentication routes
    │   └── doctors.js       # Doctor routes
    └── utils/
        └── jwt.js           # JWT utilities
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

The `.env` file is already set up with your MongoDB credentials:

```env
PORT=5000
MONGODB_URI=mongodb+srv://dulanjanassd_db_user:DR34KJpVUzN0QvYd@cluster0.txkquae.mongodb.net/mind_haven
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2026
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### 3. Run the Server

**Development (with auto-restart):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

Server will run on: **http://localhost:5000**

---

## 📍 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint           | Access  | Description       |
| ------ | ------------------ | ------- | ----------------- |
| POST   | `/api/auth/signup` | Public  | Register new user |
| POST   | `/api/auth/login`  | Public  | Login user        |
| GET    | `/api/auth/me`     | Private | Get current user  |

### Doctor Routes (`/api/doctors`)

| Method | Endpoint               | Access           | Description                    |
| ------ | ---------------------- | ---------------- | ------------------------------ |
| GET    | `/api/doctors`         | Public           | Get all doctors (with filters) |
| GET    | `/api/doctors/:id`     | Public           | Get single doctor              |
| GET    | `/api/doctors/profile` | Private (Doctor) | Get own profile                |
| PUT    | `/api/doctors/profile` | Private (Doctor) | Update own profile             |

### Test Routes

| Method | Endpoint      | Access | Description         |
| ------ | ------------- | ------ | ------------------- |
| GET    | `/api/test`   | Public | Test API is running |
| GET    | `/api/health` | Public | Health check        |

---

## 🧪 Testing the API

### 1. Test Server is Running

```bash
curl http://localhost:5000/api/test
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

**Save the token from the response!**

### 4. Get Current User (Protected)

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Get All Doctors

```bash
curl http://localhost:5000/api/doctors
```

---

## 🔐 Authentication

This API uses **JWT (JSON Web Tokens)** for authentication.

After login/signup, you'll receive a token. Include it in requests:

```
Authorization: Bearer <your-token>
```

**Token expiration:** 7 days

---

## 📊 Database

**MongoDB Atlas:**

- Database: `mind_haven`
- Collections: `users`, `doctors`

**Models:**

- **User:** Email, password (hashed), name, userType, profile info
- **Doctor:** Professional details, linked to User via `userId`

---

## 🔧 Frontend Integration

Update your frontend API service to point to:

```javascript
const API_BASE_URL = "http://localhost:5000";
```

Example fetch:

```javascript
const response = await fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email, password }),
});
```

---

## 📝 Environment Variables

| Variable       | Description                          | Default               |
| -------------- | ------------------------------------ | --------------------- |
| `PORT`         | Server port                          | 5000                  |
| `MONGODB_URI`  | MongoDB connection string            | (configured)          |
| `JWT_SECRET`   | Secret for JWT signing               | (configured)          |
| `JWT_EXPIRE`   | Token expiration time                | 7d                    |
| `FRONTEND_URL` | Frontend URL for CORS                | http://localhost:3000 |
| `NODE_ENV`     | Environment (development/production) | development           |

---

## 🎯 Features

✅ User authentication (signup/login)
✅ Password hashing with bcrypt
✅ JWT-based authorization
✅ Role-based access control (user/doctor)
✅ Doctor profile management
✅ Doctor listing with filters
✅ MongoDB integration
✅ CORS enabled
✅ Security headers (Helmet)
✅ Request logging (Morgan)
✅ Error handling

---

## 🛡️ Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens for stateless authentication
- CORS protection
- Helmet security headers
- Environment variables for sensitive data
- Input validation

---

## 📦 Dependencies

### Production

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cors` - CORS middleware
- `helmet` - Security headers
- `morgan` - HTTP request logger
- `dotenv` - Environment variables
- `express-validator` - Input validation
- `cookie-parser` - Cookie parsing

### Development

- `nodemon` - Auto-restart on file changes

---

## 🚨 Troubleshooting

**Port already in use:**

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# OR change PORT in .env
```

**MongoDB connection error:**

- Verify internet connection
- Check MongoDB URI in `.env`
- Ensure IP is whitelisted in MongoDB Atlas

**CORS errors:**

- Verify `FRONTEND_URL` in `.env` matches your frontend URL
- Check browser console for specific CORS message

---

## 📚 Documentation

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT Docs](https://jwt.io/)

---

## ✨ Status

✅ **Ready for Production**

**Last Updated:** 2026-01-29
**Version:** 1.0.0
**Port:** 5000

---

**Happy Coding! 🚀**
