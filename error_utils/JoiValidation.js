const Joi = require("joi");

const validCamp = Joi.object({
    title: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required().min(1),
    image: Joi.string().required()
});

module.exports = validCamp;