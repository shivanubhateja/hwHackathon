var mongoose = require('mongoose');

var schema = mongoose.Schema({
    uuid: {type: String},
    macAdd: { type: String, unique: true },
    latitude: Number,
    longitude: Number,
    floor: Number
});

module.exports = { 
    beaconModel: mongoose.model("beacons", schema)
}