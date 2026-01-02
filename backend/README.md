# LookNest Backend Setup Instructions

## Prerequisites
- Node.js installed
- MongoDB Atlas account

## Setup Steps

### 1. MongoDB Atlas Configuration

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account and log in
3. Create a new cluster (choose Free Tier M0)
4. Wait for cluster creation (2-5 minutes)
5. Click "Connect" on your cluster
6. Choose "Connect your application"
7. Copy the connection string

### 2. Configure Environment Variables

1. Open the `.env` file in the `backend` folder
2. Replace the `MONGODB_URI` with your actual connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/looknest?retryWrites=true&w=majority
   ```
3. Replace `<username>` with your database username
4. Replace `<password>` with your database password
5. Replace `cluster0.xxxxx` with your actual cluster address

### 3. Start the Backend Server

```powershell
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ Connected to MongoDB Atlas
```

### 4. Start the Frontend

In a new terminal:
```powershell
cd looknest
npm start
```

## Testing Authentication

1. Open http://localhost:3000
2. Click "Sign up" to create an account
3. Fill in the form and submit
4. After successful signup, click "Log in"
5. Enter your credentials and log in

## API Endpoints

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/health` - Health check

## Troubleshooting

### MongoDB Connection Error
- Check your connection string is correct
- Make sure your IP is whitelisted in MongoDB Atlas (Network Access)
- Verify database username and password

### CORS Error
- Backend must be running on port 5000
- Frontend must be running on port 3000

### Port Already in Use
```powershell
# Kill process on port 5000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
```

## Database Models

### User Model
- fullName: String
- email: String (unique)
- password: String (hashed)
- profileImage: String
- bio: String
- followers: Array of User IDs
- following: Array of User IDs
- profileViews: Number

### Photo Model
- title: String
- description: String
- imageUrl: String
- user: User ID reference
- views: Number
- likes: Array of User IDs
- saves: Array of User IDs
