import Joi from 'joi';

export default {
  // POST /api/users
  createUser: {
    body: {
      email: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, // eslint-disable-line
      username: Joi.string().required(),
      password: Joi.string().required()
    }
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: {
      username: Joi.string().required()
    },
    params: {
      userId: Joi.string().hex().required()
    }
  },

  // POST /api/auth/login
  login: {
    body: {
      email: Joi.string().required(),
      password: Joi.string().required()
    }
  }
};
