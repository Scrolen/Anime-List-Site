const Joi = require('joi');


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(10),
        comment: Joi.string().required(),
        anime: Joi.object().id(),

    }).required()
})