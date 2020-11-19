const express = require('express');
const path = require('path');
const jikan = require('jikan-node');
const Anime = require('./models/anime');
const mongoose = require('mongoose');
const ejsmate = require('ejs-mate');
const Review = require('./models/review')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const joi = require('joi');
const app = express();
const methodOverride = require('method-override');
mongoose.set('useFindAndModify', false);
const {reviewSchema} = require('./schemas.js');
// const mal = new jikan(); NEED TO GET RID OF THIS

app.use(express.static(path.join(__dirname,'assets')));

mongoose.connect('mongodb://localhost:27017/AnimeApp', {useNewUrlParser: true, useUnifiedTopology: true});


const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", () => {
    console.log("Database connected");
});



app.use(methodOverride('_method'));
app.use(express.urlencoded({extended: true}));
app.engine('ejs', ejsmate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message);
        throw new ExpressError(400,msg);
    }else {
        next()

    }

}

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/anime', catchAsync(async (req, res) => {
    const animes = await Anime.find({});
    res.render('anime/index', { animes })
}))

app.get('/anime/new', (req, res) => {
    res.render('anime/new');
})

app.post('/anime', catchAsync(async (req, res) => {
    const animeSchema = joi.object({
        anime: joi.object({
            title: joi.string().required(),
            episodes: joi.number().required().min(0),
            genre: joi.array().required(),
            img_url: joi.string().required(),
            summary: joi.string().required()
        }).required()
    })
    const result = animeSchema.validate(req.body);
    console.log(result)
    const anime = new Anime(req.body.anime);
    await anime.save();
    res.redirect(`/anime/${anime._id}`)

}))

app.get('/anime/:id', catchAsync(async (req, res) => {
    const anime = await Anime.findById(req.params.id).populate('reviews');
    res.render('anime/detail', { anime });
}))
app.get('/anime/:id/edit', catchAsync(async (req, res) => {
    const anime = await Anime.findById(req.params.id);
    res.render('anime/edit', { anime });
}))
app.put('/anime/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const anime = await Anime.findByIdAndUpdate(id,{ ...req.body.anime })
    res.redirect(`/anime/${anime._id}`)
}))

app.delete('/anime/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Anime.findByIdAndDelete(id);
    res.redirect('/anime/');
}))

app.post('/anime/:id/reviews',validateReview, catchAsync(async(req, res) => {
    const anime = await Anime.findById(req.params.id);
    const review = new Review(req.body.review);
    review.anime = anime._id;
    anime.reviews.push(review);
    review.save();
    anime.save();
    res.redirect(`/anime/${anime._id}`);

}));

app.delete('/anime/:id/reviews/:reviewId', catchAsync(async(req, res) => {
    const {id, reviewId} = req.params;
    await Anime.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/anime/${id}`);
}));

app.all('*', (req,res,next) => {
    next(new ExpressError(404, 'Page not found'))
})


app.use((err, req, res, next) => {
    const {status = 500} = err;
    if (!err.message) err.message = 'Something Went Wrong...'
    res.status(status).render('error', {err});
})


app.listen(3000, () => {
    console.log('The DREAM HAS BEGUN!');
})





// const bleach = new Anime({_id: 1,title: 'Bleach', summary: 'The Best Anime!', genre: ['Action','Adventure','Fantasy'], episodes: 366});
// const onePiece = new Anime({_id: 2,title: 'One Piece', summary: 'Pirates', genre: ['Action','Adventure','Fantasy','Comedy'], episodes: 999});

// bleach.save()
// .then(data => {
//     console.log('Worked!');
// })
// .catch(err => {
//     console.log('Error');
//     console.log(err);
// });

// onePiece.save()
// .then(data => {
//     console.log('Worked!');
// })
// .catch(err => {
//     console.log('Error');
//     console.log(err);
// });