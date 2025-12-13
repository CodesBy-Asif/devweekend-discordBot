require('dotenv').config();
const mongoose = require('mongoose');

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const Request = require('./src/models/Request');
        const Clan = require('./src/models/Clan');

        // Check total requests
        const count = await Request.countDocuments({});
        console.log('Total Requests:', count);

        // Check approved requests
        const approved = await Request.countDocuments({ status: 'approved' });
        console.log('Approved Requests:', approved);

        // Check one approved request to see structure
        const sample = await Request.findOne({ status: 'approved' });
        if (sample) {
            console.log('Sample Approved Request:', JSON.stringify(sample, null, 2));
            console.log('clanId Type:', typeof sample.clanId);
        } else {
            console.log('No approved requests found.');
        }

        // Run aggregation
        const agg = await Request.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: '$clanId', count: { $sum: 1 } } }
        ]);
        console.log('Aggregation Result:', JSON.stringify(agg, null, 2));

        if (agg.length > 0) {
            const firstId = agg[0]._id;
            console.log('Aggregated ID Type:', typeof firstId);

            // Try to find clan
            const clan = await Clan.findById(firstId);
            console.log('Found Clan:', clan ? clan.name : 'Not Found');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

debug();
