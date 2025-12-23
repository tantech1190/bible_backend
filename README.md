# IntentionalStudy Backend API

RESTful API backend for the IntentionalStudy Bible app built with Node.js, Express, and MongoDB.

## Features

- 🔐 JWT Authentication & Authorization
- 📖 Devotionals Management
- 🎯 Interactive Quests System
- 📅 Verse of the Day
- 📚 Reading Plans with Progress Tracking
- 🙏 Prayer Tree with Community Features
- 🎨 Verse Art Studio
- 👥 User Management & Profiles
- 🛡️ Content Moderation
- 📊 Analytics Dashboard
- 🔒 Security & Rate Limiting

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet, CORS, Rate Limiting
- **Validation:** Express Validator

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/intentionalstudy
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   ADMIN_EMAIL=admin@intentionalstudy.com
   ADMIN_PASSWORD=ChangeThisPassword123!
   ```

3. **Start MongoDB:**
   
   Make sure MongoDB is running on your system.

4. **Run the server:**
   
   **Development mode:**
   ```bash
   npm run dev
   ```

   **Production mode:**
   ```bash
   npm start
   ```

The API will be available at `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Main Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile
- `PUT /api/auth/update-password` - Update password

#### Devotionals
- `GET /api/devotionals` - Get all devotionals
- `GET /api/devotionals/published` - Get published devotionals
- `GET /api/devotionals/today` - Get today's devotional
- `POST /api/devotionals` - Create devotional (Admin)
- `PUT /api/devotionals/:id` - Update devotional (Admin)
- `DELETE /api/devotionals/:id` - Delete devotional (Admin)
- `POST /api/devotionals/:id/like` - Like devotional
- `POST /api/devotionals/:id/reflect` - Add reflection

#### Quests
- `GET /api/quests` - Get all quests
- `GET /api/quests/active` - Get active quests
- `POST /api/quests` - Create quest (Admin)
- `POST /api/quests/:id/join` - Join quest
- `POST /api/quests/:id/progress` - Update progress
- `POST /api/quests/:id/complete` - Complete quest

#### Verse of the Day
- `GET /api/verse-of-day` - Get all verses
- `GET /api/verse-of-day/today` - Get today's verse
- `POST /api/verse-of-day` - Create verse (Admin)
- `POST /api/verse-of-day/:id/like` - Like verse
- `POST /api/verse-of-day/:id/share` - Share verse

#### Reading Plans
- `GET /api/reading-plans` - Get all reading plans
- `GET /api/reading-plans/active` - Get active plans
- `POST /api/reading-plans/:id/enroll` - Enroll in plan
- `POST /api/reading-plans/:id/progress` - Update progress
- `POST /api/reading-plans/:id/complete` - Complete plan

#### Prayers
- `GET /api/prayers/my-prayers` - Get user's prayers
- `GET /api/prayers/public` - Get public prayers
- `POST /api/prayers` - Create prayer
- `POST /api/prayers/:id/pray` - Pray for someone
- `POST /api/prayers/:id/answer` - Mark prayer as answered

#### Verse Art
- `GET /api/verse-art/public` - Get public verse art
- `GET /api/verse-art/user/my-art` - Get user's art
- `POST /api/verse-art` - Create verse art
- `POST /api/verse-art/:id/like` - Like art
- `POST /api/verse-art/:id/download` - Download art

#### Users (Admin)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id/status` - Update user status
- `PATCH /api/users/:id/role` - Update user role

#### Moderation (Admin/Moderator)
- `GET /api/moderation/flagged-content` - Get flagged content
- `GET /api/moderation/pending-comments` - Get pending comments
- `POST /api/moderation/warn-user/:userId` - Warn user
- `POST /api/moderation/suspend-user/:userId` - Suspend user

#### Analytics (Admin)
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/users` - User analytics
- `GET /api/analytics/engagement` - Engagement analytics
- `GET /api/analytics/content` - Content analytics

## Testing

Use the provided `api-collection.json` file with Postman or Thunder Client to test all endpoints.

## Project Structure

```
backend/
├── controllers/       # Request handlers
├── models/           # MongoDB schemas
├── routes/           # API routes
├── middleware/       # Auth & validation middleware
├── .env.example      # Environment variables template
├── server.js         # Entry point
└── package.json      # Dependencies
```

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Rate limiting on API endpoints
- Helmet for security headers
- CORS protection
- Input validation and sanitization

## Error Handling

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev mode only)"
}
```

## License

MIT License - See LICENSE file for details
