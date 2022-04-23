const Joi = require('joi-oid');

module.exports = {
    getById:{
        params:Joi.object({
            id: Joi.number().description('get room details and applications by id')
        })
    },
    register: {
        payload: Joi.object({
            description : Joi.string().optional().description('Room description'),
            price: Joi.number().optional().description("Room's price"),
            room_count: Joi.number().optional().description("Number of rooms"),
            price_negotiable: Joi.boolean().description("If room's price is negotiable"),
            location: Joi.string().optional().description("location of room"),
            room_images: Joi.array().items(Joi.any().meta({ swaggerType: 'file' })).description('Issuer Documents'),
        }),
    },
}