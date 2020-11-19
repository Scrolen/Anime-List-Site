const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

var  genres = ['Action', 'Adventure','Cars','Cartoon','Comedy','Dementia','Demons','Drama','Dub','Ecchi','Fantasy'
,'Game','Harem','Historical','Horror','Isekai','Josei','Kids','Magic','Martial Arts','Mecha','Military','Movie','Music',
'Mystery','ONA','OVA','Parody','Police','Psychological','Romance','Samurai','School','Sci-Fi','Seinen','Shoujo','Shoujo Ai',
'Slice of Life','Space','Special','Sports','Super Power','Supernatural','Thriller','Vampire','Yuri'];

const animeSchema = new Schema({

    title:{
        type: String,
        required: true
    },
    summary:{
        type: String,
    },
    genre: {
        type: [String],
        enum: genres,
    },
    episodes:{
        type: Number,
        min: 0,
        required: true
    },
    rank:{
        type: Number
    },
    score:{
        type: Number,
        min: 0,
        max: 10,
    },
    img_url:{
        type: String,
    },
    watched:{
        type: Number,
        default: 0
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})


animeSchema.post('findOneAndDelete', async function(doc) {
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})


const Anime = mongoose.model('Anime',animeSchema);

module.exports = Anime;