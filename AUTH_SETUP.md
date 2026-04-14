# FilmSort - MongoDB Authentication Setup

## Overview

FilmSort now includes a complete MongoDB-based authentication system with user registration, profile creation, and profile switching (Netflix-style).

## Features

✅ **User Authentication**

- Register new account (name, email, password)
- Login with email and password
- Secure password hashing with bcryptjs
- JWT token-based auth

✅ **Profile System**

- Create multiple profiles per account (like Netflix)
- Choose from 6 unique avatar styles
- Profile switching
- Profile management
- New users are prompted to scan their media files

✅ **Protected Routes**

- Automatic redirect to login if not authenticated
- Profile selection before accessing content
- Logout functionality

## Prerequisites

- Node.js v16+
- npm or yarn
- MongoDB (local or MongoDB Atlas cloud)

## Installation & Setup

### 1. **Install Dependencies**

```bash
npm install
```

### 2. **Configure MongoDB**

#### Option A: Local MongoDB

Install MongoDB locally and ensure it's running on `mongodb://localhost:27017`

#### Option B: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a project and cluster
3. Get your connection string

### 3. **Environment Configuration**

Create or update `.env` file in project root:

```env
# MongoDB Connection URI
MONGODB_URI=mongodb://localhost:27017/filmsort
# OR for MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/filmsort?retryWrites=true&w=majority

# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-key-change-in-production

# Server Port
PORT=5000
```

### 4. **Start Backend Server**

In a new terminal:

```bash
npm run server
```

Expected output:

```
✓ MongoDB connected
✓ Server running on http://localhost:5000
```

### 5. **Start Frontend Development Server**

In another terminal:

```bash
npm run dev
```

The app should open at `http://localhost:5173`

## Usage Flow

### First Time User

1. **Auth Page** (`/auth`)
   - Click "Sign Up" tab
   - Enter name, email, password
   - Click "Create Account"

2. **Profile Selection** (`/profiles`)
   - App automatically navigates here after registration
   - Click "+ Add Profile" to create first profile
   - Enter profile name
   - Choose avatar color
   - Toggle kids profile if needed
   - Click "Save"

3. **Home Page** (`/`)
   - Select profile from "Who's watching?" page
   - Directed to main FilmSort home page
   - Use app normally

### Returning User

1. **Login** (`/auth`)
   - Enter email and password
   - Click "Sign In"

2. **Select Profile** (`/profiles`)
   - Click on existing profile or create new one
   - Directed to home page

3. **Switch Profile**
   - Click profile avatar in top-right navbar
   - Select "Switch Profile"
   - Choose different profile
   - Or click "Sign Out" to logout

## API Endpoints

### Authentication Routes

**POST** `/api/auth/register`

```jsonapi/auth
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

Returns: `{ token, user }`

**POST** `/api/auth/login`

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

Returns: `{ token, user, profiles }`

**GET** `/api/auth/me`

- Headers: `Authorization: Bearer <token>`
- Returns: `{ user }`

### Profile Routes

**POST** `/api/profiles` (create profile)

```json
{
  "name": "Profile Name",
  "avatar": "avatar-1"
}
```

Avatar options: `avatar-1` through `avatar-6`

- Headers: `Authorization: Bearer <token>`

**GET** `/api/profiles` (get user's profiles)

- Headers: `Authorization: Bearer <token>`

**DELETE** `/api/profiles/:profileId` (delete profile)

- Headers: `Authorization: Bearer <token>`

## Project Structure

```
filmoor/
├── server/
│   ├── index.js                    # Express server setup
│   ├── models/
│   │   ├── User.js                # User schema (name, email, password, profiles)
│   │   └── Profile.js             # Profile schema (name, avatarColor, isKidsProfile)
│   └── routes/
│       ├── auth.js                # Auth endpoints (register, login, me)
│       └── profiles.js            # Profile endpoints (CRUD)
├── src/
│   ├── context/
│   │   └── AuthContext.jsx        # Auth state management with axios
│   ├── pages/
│   │   ├── Auth.jsx              # Login/Register page
│   │   ├── Profiles.jsx          # Profile selection & creation page
│   │   ├── Home.jsx              # Main home page
│   │   └── Library.jsx           # Library page
│   ├── components/
│   │   ├── ProtectedRoute.jsx    # Route protection wrapper
│   │   ├── Navbar.jsx            # Navigation with profile menu
│   │   └── ...
│   └── App.jsx                    # Entry point with routing
├── .env                           # Environment variables
└── package.json                   # Dependencies
```

## Key Technologies

- **Backend**
  - Express.js - Web server
  - MongoDB - Database
  - Mongoose - ODM
  - bcryptjs - Password hashing
  - JWT - Authentication tokens

- **Frontend**
  - React 18 - UI library
  - React Router - Routing
  - Axios - HTTP client
  - Context API - State management

## Database Schema

### User Document

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  profiles: [ObjectId], // Array of Profile IDs
  createdAt: Date,
  updatedAt: Date
}
```

### Profile Document

```javascript
{
  _id: ObjectId,
  name: String,
  userId: ObjectId, // Reference to User
  avatar: String, // avatar-1 through avatar-6
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### "Cannot connect to MongoDB"

- Ensure MongoDB is running locally or connection string is correct
- Check `.env` file for `MONGODB_URI`
- Verify MongoDB is accessible at the specified address

### "CORS error"

- Backend server might not be running on port 5000
- Check if `npm run server` is still running
- Verify API base URL in `AuthContext.jsx` points to correct server

### "Token expired"

- JWT tokens expire after 7 days
- User will be automatically logged out
- They can login again to get new token

### "Profile not loading"

- Clear browser cache and localStorage
- Logout and login again with `localStorage.clear()`
- Check browser DevTools Network tab for API errors

## Security Notes

⚠️ **Production Deployment**

Before deploying to production:

1. **Change JWT_SECRET** in `.env` to a strong, random value
2. **Enable MongoDB authentication** with strong passwords
3. **Use HTTPS** for all connections
4. **Restrict CORS origins** to your domain:
   ```javascript
   res.header("Access-Control-Allow-Origin", "https://yourdomain.com");
   ```
5. **Add rate limiting** to prevent brute force attacks
6. **Use environment-specific configs** for dev/staging/production
7. **Enable password validation** rules (min length, complexity)
8. **Add email verification** for new registrations
9. **Implement refresh tokens** for better security

## Next Steps

- Add email verification for registration
- Implement password reset functionality
- Add social login (Google, GitHub)
- Enable profile-specific watchlists
- Add user preferences per profile

## Support

For issues or questions about the auth system, check:

1. Browser console for errors
2. Terminal output from `npm run server`
3. MongoDB logs for database issues
4. Network tab in browser DevTools
