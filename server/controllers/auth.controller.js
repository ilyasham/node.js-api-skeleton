import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import bcrypt from 'bcrypt';

import APIError from '../helpers/APIError';
import config from '../../config/config';
import User from '../models/user.model'

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
const login = async (req, res, next) => {

  console.info('Login API!');
  const { email, password } = req.body;
  const user = await User.findOne({
    email
  });
  if (user) {
    const bAuthed = await bcrypt.compare(password, user.password);
    if (bAuthed === true) {
      const token = jwt.sign({
        _id: user._id.toString()
      }, config.jwtSecret);
      return res.json({
        token,
        user: user
      });
    }
  }
  const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
  return next(err);
}

/**
 * This is a middleware to check the JWT
 * @param req
 * @param res
 * @returns {*}
 */
const checkJWT = (req, res, next) => {
  const { authorization } = req.headers;
  jwt.verify(authorization, config.jwtSecret, (err, decoded) => {
    if (err) {
      const err = new APIError('Invalid Token!', httpStatus.UNAUTHORIZED, true);
      return next(err);
    } else {
      const { _id } = decoded;
      User.findById(_id, (err, user) => {
        if (err) {
          next(new APIError('Failed to load user from DB'));
        } else {
          req.currentUser = user;
          next();
        }
      });
    }
  });
}

export default { login, checkJWT };
