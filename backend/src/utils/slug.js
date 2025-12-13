// Shared slug generator for Clan and Mentee models
function generateSlug(name) {
    if (!name) return '';
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

module.exports = { generateSlug };
