const { Mentee, Clan, Request } = require('../models');
const logService = require('./logService');
const bot = require('../bot');
const { getGuildId } = require('../utils/guildId');
const csv = require('csv-parser');
const { Readable } = require('stream');

function generateSlug(name) {
    if (!name) return '';
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

async function listMentees(query, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const filter = {};

    if (query.search) {
        filter.$or = [
            { name: { $regex: query.search, $options: 'i' } },
            { email: { $regex: query.search, $options: 'i' } },
            { assignedClan: { $regex: query.search, $options: 'i' } }
        ];
    }
    if (query.status) {
        filter.status = query.status;
    }

    const [mentees, total] = await Promise.all([
        Mentee.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Mentee.countDocuments(filter)
    ]);

    return {
        mentees,
        pagination: {
            page,
            pages: Math.ceil(total / limit),
            total
        }
    };
}

async function getStats() {
    const [total, notVerified, otpSent, verified] = await Promise.all([
        Mentee.countDocuments({}),
        Mentee.countDocuments({ status: 'not_verified' }),
        Mentee.countDocuments({ status: 'otp_sent' }),
        Mentee.countDocuments({ status: 'verified' })
    ]);

    return { total, notVerified, otpSent, verified };
}

async function createMentee(data, adminUser) {
    const { name, email, assignedClan } = data;

    const existing = await Mentee.findOne({ email: email.toLowerCase() });
    if (existing) {
        throw new Error('A mentee with this email already exists');
    }

    const mentee = new Mentee({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        assignedClan: assignedClan?.trim() || null,
        status: 'not_verified'
    });

    await mentee.save();

    await logService.log('MENTEE_CREATED', adminUser, `Created mentee: ${name} (${email})`);

    return mentee;
}

async function processCsvUpload(buffer, adminUser) {
    const validClans = await Clan.find({ enabled: true });
    const clanMap = new Map();

    validClans.forEach(c => {
        clanMap.set(c.slug, c.name);
        clanMap.set(c.name.toLowerCase().trim(), c.name);
    });

    const results = [];
    let skipped = 0;

    const columnMap = {
        name: ['name', 'full name', 'fullname', 'mentee name', 'student name'],
        email: ['email', 'email address', 'e-mail', 'mail'],
        clan: ['clan', 'assigned clan', 'clan name', 'group', 'team']
    };

    const stream = Readable.from(buffer.toString());
    const missingClans = new Set();

    await new Promise((resolve, reject) => {
        stream
            .pipe(csv())
            .on('data', (row) => {
                const normalizedRow = {};
                Object.keys(row).forEach(key => {
                    normalizedRow[key.toLowerCase().trim()] = row[key];
                });

                let name = null, email = null, clan = null;

                for (const [field, aliases] of Object.entries(columnMap)) {
                    for (const alias of aliases) {
                        if (normalizedRow[alias]) {
                            if (field === 'name') name = normalizedRow[alias].trim();
                            if (field === 'email') email = normalizedRow[alias].trim().toLowerCase();
                            if (field === 'clan') clan = normalizedRow[alias].trim();
                            break;
                        }
                    }
                }

                if (email && clan) {
                    const clanSlug = generateSlug(clan);
                    const clanText = clan.toLowerCase();

                    let matchedClanName = clanMap.get(clanSlug) || clanMap.get(clanText.trim());

                    if (!matchedClanName) {
                        const sortedClans = validClans.sort((a, b) => b.name.length - a.name.length);
                        for (const c of sortedClans) {
                            if (clanText.includes(c.name.toLowerCase())) {
                                matchedClanName = c.name;
                                break;
                            }
                        }
                    }

                    if (matchedClanName) {
                        results.push({
                            name: name || 'Unknown',
                            email,
                            assignedClan: matchedClanName,
                            assignedClanSlug: generateSlug(matchedClanName),
                            status: 'not_verified',
                            emailVerified: false
                        });
                    } else {
                        skipped++;
                        missingClans.add(clan);
                    }
                }
            })
            .on('end', resolve)
            .on('error', reject);
    });

    if (results.length === 0) {
        const missingList = Array.from(missingClans).slice(0, 5).join(', ');
        const moreCount = missingClans.size > 5 ? ` and ${missingClans.size - 5} more` : '';
        throw new Error(skipped > 0
            ? `No valid mentees found. Skipped ${skipped} records. Missing clans: ${missingList}${moreCount}. Please create these clans first.`
            : 'No valid mentee records found in CSV.');
    }

    const bulkOps = results.map(mentee => ({
        updateOne: {
            filter: { email: mentee.email },
            update: { $set: mentee },
            upsert: true
        }
    }));

    const result = await Mentee.bulkWrite(bulkOps);

    await logService.log('CSV_UPLOAD', adminUser, {
        imported: results.length,
        inserted: result.upsertedCount,
        updated: result.modifiedCount,
        skipped
    });

    return {
        imported: results.length,
        inserted: result.upsertedCount,
        updated: result.modifiedCount,
        skipped
    };
}

async function deleteMentee(id, adminUser) {
    const mentee = await Mentee.findOneAndDelete({ _id: id });
    if (mentee) {
        await logService.log('MENTEE_DELETE', adminUser, { name: mentee.name, email: mentee.email });
    }
    return mentee;
}

async function updateMentee(id, updates, adminUser) {
    const oldMentee = await Mentee.findOne({ _id: id });
    if (!oldMentee) return null;

    if (updates.assignedClan) {
        updates.assignedClanSlug = generateSlug(updates.assignedClan);
    }

    const mentee = await Mentee.findOneAndUpdate(
        { _id: id },
        { $set: updates },
        { new: true }
    );

    if (updates.assignedClan && oldMentee.assignedClan !== mentee.assignedClan) {
        await logService.log('MENTEE_UPDATE', adminUser, {
            target: mentee.email,
            field: 'assignedClan',
            oldValue: oldMentee.assignedClan,
            newValue: mentee.assignedClan
        });
    }

    return mentee;
}

async function bulkDelete(ids, adminUser) {
    const result = await Mentee.deleteMany({ _id: { $in: ids } });

    await logService.log('MENTEE_BULK_DELETE', adminUser, { count: result.deletedCount });

    return result.deletedCount;
}

async function clearAll(adminUser) {
    const result = await Mentee.deleteMany({});

    await logService.log('MENTEE_CLEAR_ALL', adminUser, { count: result.deletedCount });

    return result.deletedCount;
}




// Helper to remove role on unlink
async function removeClanRole(discordId, assignedClan) {
    try {
        if (!discordId || !assignedClan) return;

        const guildId = getGuildId();
        if (!guildId) return;

        const guild = await bot.client.guilds.fetch(guildId);
        if (!guild) return;

        const member = await guild.members.fetch(discordId).catch(() => null);
        if (!member) return;

        // Find clan role
        const clan = await Clan.findOne({ name: assignedClan });
        if (!clan || !clan.roleId) return;

        await member.roles.remove(clan.roleId, 'Account unlinked by admin');

    } catch (error) {
        console.error(`Failed to remove role for ${discordId}:`, error);
    }
}

async function unlinkMentee(id, adminUser) {
    const mentee = await Mentee.findById(id);
    if (!mentee) return null;

    // Remove role first while we have the data
    if (mentee.discordId && mentee.assignedClan) {
        await removeClanRole(mentee.discordId, mentee.assignedClan);
    }

    const updatedMentee = await Mentee.findByIdAndUpdate(
        id,
        {
            $set: {
                discordId: null,
                discordUsername: null,
                status: 'not_verified',
                emailVerified: false,
                verifiedAt: null
            }
        },
        { new: true }
    );

    if (updatedMentee) {
        // Delete all requests associated with this mentee
        await Request.deleteMany({ menteeId: mentee._id });

        await ActivityLog.create({
            action: 'MENTEE_UNLINK',
            adminId: adminUser.id,
            adminName: adminUser.username,
            targetId: mentee._id,
            details: { email: mentee.email }
        });
    }

    return updatedMentee;
}

module.exports = {
    listMentees,
    getStats,
    createMentee,
    processCsvUpload,
    deleteMentee,
    updateMentee,
    bulkDelete,
    clearAll,
    unlinkMentee
};
