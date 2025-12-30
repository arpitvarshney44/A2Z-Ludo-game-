# A2Z Ludo - Gaming Platform

A full-stack gaming platform for Ludo with real money transactions, built with React, Node.js, Express, and MongoDB.

## Project Structure

```
├── admin/          # Admin panel (React + Vite)
├── client/         # User-facing app (React + Vite)
├── server/         # Backend API (Node.js + Express)
└── README.md
```

## Features

### User App (Client)
- User authentication (Phone number + OTP)
- Wallet management (Deposits & Withdrawals)
- Game lobby and matchmaking
- Real-time game updates
- Referral system
- Transaction history
- Support tickets
- KYC verification

### Admin Panel
- Dashboard with analytics
- User management
- Transaction management (Approve/Reject withdrawals)
- Game monitoring
- KYC verification
- Support ticket management
- Payment settings configuration
- Game settings (Commission rate, Referral bonus)
- Policy management
- Password change

### Backend
- RESTful API
- JWT authentication
- File upload handling
- Real-time updates with Socket.io
- MongoDB database
- Payment gateway integration
- Admin role-based access control

## Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS
- Zustand (State management)
- React Router
- Axios
- React Hot Toast
- Framer Motion

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Bcrypt for password hashing
- Multer for file uploads
- Socket.io for real-time features

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd a2z-ludo
```

2. Install dependencies for all folders

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd client
npm install
```

**Admin:**
```bash
cd admin
npm install
```

3. Set up environment variables

Create `.env` files in each folder:

**server/.env:**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

**client/.env:**
```env
VITE_API_URL=http://localhost:5000/api
```

**admin/.env:**
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development servers

**Server:**
```bash
cd server
npm run dev
```

**Client:**
```bash
cd client
npm run dev
```

**Admin:**
```bash
cd admin
npm run dev
```

## Default Admin Credentials

After setting up the database, create an admin user or use the seeded credentials if available.

## API Endpoints

### User Routes
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

### Wallet Routes
- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/deposit` - Create deposit request
- `POST /api/wallet/withdraw` - Create withdrawal request
- `GET /api/wallet/transactions` - Get transaction history

### Game Routes
- `GET /api/games` - Get available games
- `POST /api/games/join` - Join a game
- `GET /api/games/history` - Get game history

### Admin Routes
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/transactions` - Get all transactions
- `PUT /api/admin/transaction/:id` - Update transaction status
- `GET /api/admin/games` - Get all games
- `PUT /api/admin/change-password` - Change admin password

## Deployment

### Server
1. Set environment variables in production
2. Build and deploy to your hosting service (Heroku, AWS, DigitalOcean, etc.)

### Client & Admin
1. Build the production bundle:
```bash
npm run build
```
2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

## Security Notes

- Never commit `.env` files
- Keep JWT secrets secure
- Use HTTPS in production
- Implement rate limiting
- Validate all user inputs
- Use secure payment gateways

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For support, email support@a2zludo.com or create an issue in the repository.
