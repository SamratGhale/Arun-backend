const Joi = require('joi-oid');

module.exports = {
    register: {
        payload: Joi.object({
            room: Joi.number().description('Room id'),
            query: Joi.string().optional().description("Any query about the room"),
        }),
    },
    approve: {
        params: Joi.object({
            id: Joi.number().description("Application's id"),
        }),
    }
}