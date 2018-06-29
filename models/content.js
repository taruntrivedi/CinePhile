
var mongoose = require("mongoose");


var contentSchema = new mongoose.Schema({
    title: String,
    body: String,
    image:String,
    created: {
        type: Date,
        default: Date.now
    },
    comments: [{
        ref: "Comment",
        type: mongoose.Schema.Types.ObjectId

    }],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }

});
module.exports = mongoose.model("Content", contentSchema);