const Joi = require('joi-oid');

module.exports = {
  findById: {
    params: Joi.object({
      id: Joi.objectId(),
    }),
  },
  register: {
    payload: Joi.object({
      username: Joi.string().optional().description('user email'),
      email: Joi.string().description('user email'),
      password: Joi.string().description('user password'),
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
  archive: {
    params: Joi.object({
      id: Joi.objectId(),
    }),
  },
  update: {
    params: Joi.object({
      id: Joi.objectId(),
    }),
    payload: Joi.object({
      username: Joi.string().optional().description('user email'),
      email: Joi.string().description('user email'),
      password: Joi.string().description('user password'),
      is_admin: Joi.boolean().description('is user an admin'),
    }),
  },
};