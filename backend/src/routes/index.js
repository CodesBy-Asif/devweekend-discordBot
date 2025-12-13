const authRoutes = require('./auth');
const clanRoutes = require('./clans');
const requestRoutes = require('./requests');
const configRoutes = require('./config');
const statsRoutes = require('./stats');
const discordRoutes = require('./discord');
const menteeRoutes = require('./mentees');
module.exports = {
    authRoutes,
    clanRoutes,
    requestRoutes,
    configRoutes,
    statsRoutes,
    discordRoutes,
    menteeRoutes
};
