const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: {
        type: String,
    },
    rating:{
        type: Number,
        required: true,
    },
    
    anime: {
        type: Schema.Types.ObjectId,
        ref: 'Anime',
    }
})


module.exports = mongoose.model("Review", reviewSchema);