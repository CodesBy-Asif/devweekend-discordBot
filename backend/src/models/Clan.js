const mongoose = require('mongoose');
const { generateSlug } = require('../utils/slug');

const clanSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, unique: true },
    roleId: { type: String, required: true },
    enabled: { type: Boolean, default: true }
}, { timestamps: true });

clanSchema.pre('save', function (next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = generateSlug(this.name);
    }
    next();
});

clanSchema.statics.findBySlug = function (slug) {
    return this.findOne({ slug: generateSlug(slug), enabled: true });
};

clanSchema.statics.generateSlug = generateSlug;

module.exports = mongoose.model('Clan', clanSchema);
