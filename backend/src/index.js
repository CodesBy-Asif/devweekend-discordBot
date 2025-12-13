require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const bot = require('./bot');
const emailService = require('./services/email');
const { authRoutes, clanRoutes, requestRoutes, configRoutes, statsRoutes, discordRoutes, menteeRoutes } = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clans', clanRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/config', configRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/discord', discordRoutes);
app.use('/api/mentees', menteeRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        bot: bot.client?.isReady() ? 'connected' : 'disconnected',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function start() {
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clan-bot');
        console.log('✅ MongoDB connected');

        // Initialize email service
        emailService.initialize();

        // Start Discord bot
        console.log('🤖 Starting Discord bot...');
        await bot.start();

        // Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 API server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start:', error);
        process.exit(1);
    }
}

start();
