const Joi = require('joi-oid');

module.exports = {
  findById: {
    params: Joi.object({
      id: Joi.number(),
    }),
  },
  register: {
    payload: Joi.object({
      username: Joi.string().optional().description('user email'),
      email: Joi.string().description('user email'),
      password: Joi.string().description('user password'),
      phone: Joi.string().description('user phone'),
      is_admin: Joi.boolean().description('is user an admin'),
    }),
  },
  auth: {
    params: Joi.object({
      token: Joi.string(),
    }),
  },
  login: {
    payload: Joi.object({
      email: Joi.string().optional().description('user email'),
      password: Joi.string().optional().description('user password'),
      is_admin: Joi.boolean().optional().description('is user an admin'),
    }),
  },

  changePassword: {
    payload: Joi.object({
      oldPassword: Joi.string().description('user email'),
      newPassword: Joi.string().description('user password'),
    }),
  },
  changeProfilePic:{
    payload:Joi.object({
      image: Joi.any().meta({ swaggerType: 'file' }).description('new profile pic')
    })
  },
  archive: {
    params: Joi.object({
      id: Joi.number(),
    }),
  },
  approve: {
    params: Joi.object({
      id: Joi.number(),
    }),
  },
  update: {
    params: Joi.object({
      id: Joi.number(),
    }),
    payload: Joi.object({
      username: Joi.string().optional().description('user email'),
      phone: Joi.string().optional().description('user phone'),
      email: Joi.string().description('user email'),
    }),
  },
};