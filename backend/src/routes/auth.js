const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Config } = require('../models');

// Cookie options for production
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
};

// Admin Key Verification
router.post('/verify-key', async (req, res) => {
    const { adminKey } = req.body;

    if (!adminKey) {
        return res.status(400).json({ error: 'Admin Key required' });
    }

    const staticKey = process.env.ADMIN_KEY;

    if (adminKey !== staticKey) {
        return res.status(401).json({ error: 'Invalid Admin Key' });
    }

    // Key is valid - Create a "Mock" admin user session token
    const guildId = process.env.GUILD_ID;

    // We create a token that LOOKS like a real Discord user but is just for admin access
    const userPayload = {
        id: 'admin_user',
        username: 'Administrator',
        discriminator: '0000',
        avatar: null,
        guilds: [
            {
                id: guildId,
                name: 'Managed Server',
                isAdmin: true
            }
        ]
    };

    // Create JWT
    const jwtToken = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Set HTTP-only cookie
    res.cookie('token', jwtToken, cookieOptions);

    res.json({ success: true, user: userPayload, token: jwtToken });
});

// Logout - clear cookie
router.post('/logout', (req, res) => {
    res.clearCookie('token', { path: '/' });
    res.json({ success: true });
});

// Verify token
router.get('/me', authenticateToken, (req, res) => {
    res.json(req.user);
});

// Middleware to verify JWT from cookie OR header (backwards compatible)
function authenticateToken(req, res, next) {
    // Try cookie first, then Authorization header
    let token = req.cookies?.token;

    if (!token) {
        const authHeader = req.headers.authorization;
        token = authHeader && authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    // Try JWT_SECRET first, then NEXTAUTH_SECRET (for frontend-generated tokens)
    const secrets = [
        process.env.JWT_SECRET,
        process.env.NEXTAUTH_SECRET
    ].filter(Boolean);

    let decoded = null;
    let lastError = null;

    for (const secret of secrets) {
        try {
            decoded = jwt.verify(token, secret);
            break;
        } catch (err) {
            lastError = err;
        }
    }

    if (!decoded) {
        console.error('Token verification failed:', lastError?.message);
        return res.status(403).json({ error: 'Invalid token' });
    }

    // Check if user is admin of the configured guild
    const configuredGuildId = process.env.GUILD_ID;
    if (configuredGuildId) {
        const userGuilds = decoded.guilds || [];
        const configuredGuild = userGuilds.find(g => g.id === configuredGuildId);

        if (!configuredGuild || !configuredGuild.isAdmin) {
            return res.status(403).json({
                error: 'Access denied. You must be an administrator of this server.'
            });
        }
    }

    req.user = decoded;
    next();
}

module.exports = router;
module.exports.authenticateToken = authenticateToken;
