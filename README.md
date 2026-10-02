# Rental Platform

A full-stack marketplace for renting items between users, featuring secure payments, real-time messaging, and comprehensive administrative controls.

## Tech Stack
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io
- **Validation**: Zod
- **Authentication**: JWT, bcryptjs

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)

## Setup Instructions

1. Clone the repository and navigate to the `server` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables by creating a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/rental-platform
   JWT_SECRET=your_super_secret_jwt_key
   CLIENT_URL=http://localhost:3000
   ```
4. Seed the database with initial data (Admin, Users, Items, Configs):
   ```bash
   node scripts/seed.dev.js
   ```
   *Default login for admin is `admin@rental.com` / `password123`*
5. Start the development server:
   ```bash
   npm run dev
   ```

## Architecture

- **`src/sockets/`**: Contains Socket.io implementations for real-time features like chat and dispute mediation.
- **`src/validators/`**: Contains Zod validation schemas for all incoming API requests (Auth, Items, Bookings, Disputes, etc.).
- **`scripts/`**: Utility scripts like database seeding.

## WebSockets
Websockets are implemented using `socket.io` for real-time capabilities. Connect to the root URL and pass a JWT token in the authentication payload to establish a secure connection.

**Events:**
- `join_dispute`: Connect to a specific dispute room.
- `leave_dispute`: Leave a dispute room.
- `send_dispute_message`: Send a real-time message within a dispute.
- `receive_dispute_message`: Listen for incoming messages on a dispute.

## Validation Strategy
The application relies heavily on Zod for request validation. Zod schemas are defined in `src/validators` and should be utilized in middleware to guarantee that incoming HTTP payload matches the expected shape before hitting the controllers.
