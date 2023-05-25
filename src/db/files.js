const mongoose = require('mongoose');

const file = new mongoose.Schema({
    file_address: {
        type: String
    },
    file_cid: {
        type: String,
    },
    file_name: {
        type: String,
    },
    file_type: {
        type: String,
    },
    time_created: {
        type: Date,
        default: Date.now
    },
    owner: {
        type: String
    },
    shared: {
        type: Array
    },
    versions: {
        type: Array
    }
});

module.exports = Files = mongoose.model('file', file);