
var mongoose = require("mongoose");


var contentSchema = new mongoose.Schema({
    title: String,
    body: String,
    created: {
        type: Date,
        default: Date.now
    },
    comments: [{
        ref: "Comment",
        type: mongoose.Schema.Types.ObjectId

    }]

});
module.exports = mongoose.model("Content", contentSchema);