# 🤖 DW AI - Discord Mentee Verification System

A comprehensive Discord bot solution for DevWeekend to automate mentee verification, manage clan roles, and handle temporary voice channels. Features a secure, modern Next.js admin dashboard.

## ✨ Features

### 🔐 Verification System
- **Email Modal Flow**: Seamless verification via Discord modals.
- **OTP Validation**: Secure 6-digit email verification code.
- **Request Monitoring**: Real-time status tracking of all verification requests (Verified, OTP Sent, Expired, Failed).
- **Auto-Role Assignment**: Instantly assigns Clan Roles upon successful verification.
- **Anti-Abuse**: Duplicate verification protection and rate limiting.

### 🛡️ Clan Management
- **Role-Based Clans**: Create and manage clans directly linked to Discord roles.
- **Dynamic Voice Channels**: "Join to Create" functionality for private clan meetings.
    - **Smart routing**: Auto-detects user's clan role.
    - **Multi-Clan Support**: Interactive DM selection for users with multiple clan roles.
    - **Auto-Cleanup**: Temporary channels delete themselves when empty.

### 💻 Admin Dashboard
- **Modern UI**: Built with Next.js 14, Tailwind CSS, and Glassmorphism design.
- **Secure Access**: Protected by a custom Admin Key (no Discord OAuth complexity).
- **Mentee Management**:
    - Bulk CSV Import with fuzzy matching.
    - Edit/Delete mentee records.
    - **Role Synchronization**: Changing a verified user's clan automatically updates their role on Discord.
    - **Unlink Accounts**: Reset verification status to allow re-verification.
- **Verification Requests**: View logs of all verification attempts.
- **Audit Logging**: All admin actions are logged to a configured Discord channel.
- **Analytics**: Visual breakdown of verified users.

## �️ Tech Stack
- **Frontend**: Next.js 14, Redux Toolkit, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, Discord.js v14, MongoDB
- **Security**: JWT Authentication, Admin Key Protection

---

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed/configured:
- **Node.js**: v18 or higher
- **MongoDB**: Local instance or Atlas URI
- **Discord Application**: Bot Token & Client ID

### ⚙️ Environment Configuration

You will need to configure both Backend and Frontend `.env` files.

#### Backend (`backend/.env`)
```ini
# Server
PORT=5000
FRONTEND_URL=http://localhost:3000

# Security (CRITICAL)
ADMIN_KEY=your_secure_admin_key_here
JWT_SECRET=your_super_secret_jwt_key_here
GUILD_ID=your_discord_server_id_here

# Database
MONGODB_URI=mongodb://localhost:27017/clan-bot

# Discord
DISCORD_TOKEN=your_bot_token

# Email (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Frontend (`frontend/.env`)
```ini
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# API Connection
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 💿 Installation & Run

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devweekend-discordBot
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   # Server runs on http://localhost:5000
   ```

3. **Frontend Setup** (Open new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   # Dashboard runs on http://localhost:3000
   ```

---

## ❓ Troubleshooting

- **"Invalid Admin Key"**: Ensure the `ADMIN_KEY` in `backend/.env` matches the key you are using to log in on the frontend.
- **Bot not responding**: Check if the bot has the `Use Application Commands` permission and is invited to the server with `applications.commands` scope.
- **Email not sending**: If using Gmail, ensure you are using an **App Password**, not your login password.
