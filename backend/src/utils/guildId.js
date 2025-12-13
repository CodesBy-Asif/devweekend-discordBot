// Single-server mode: Get guild ID from environment variable
function getGuildId() {
    const guildId = process.env.GUILD_ID;
    if (!guildId) {
        throw new Error('GUILD_ID not configured in environment variables');
    }
    return guildId;
}

module.exports = { getGuildId };
