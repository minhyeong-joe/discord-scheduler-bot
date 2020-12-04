const mongoose = require('mongoose');

const EventSchema = mongoose.Schema({
    event_name: {
        type: String,
        required: true
    },
    members: {
        type: [String],
        required: true
    },
    time: {
        type: Date,
        required: true
    },
    max_occupancy: {
        type: Number
    }
});

const event = module.exports = mongoose.model('event', EventSchema);