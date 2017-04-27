import bcrypt from 'bcrypt';
import User from '../models/user.model';
import httpStatus from 'http-status';

/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  User.get(id)
    .then((user) => {
      req.user = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
  return res.json(req.user);
}

/**
 * Create new user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
function create(req, res, next) {

  bcrypt.hash(req.body.password, 12, function(err, hash) {
    if (err) {
      return next('Invalid Password!');
    } else {
      const user = new User({
        email: req.body.email,
        username: req.body.username,
        password: hash
      });

      user.save()
        .then(savedUser => res.json(savedUser))
        .catch(e => next(e));
    }
  });


}

/**
 * Update existing user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
function update(req, res, next) {
  const user = req.user;
  user.username = req.body.username;
  user.mobileNumber = req.body.mobileNumber;

  user.save()
    .then(savedUser => res.json(savedUser))
    .catch(e => next(e));
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  User.list({ limit, skip })
    .then(users => res.json(users))
    .catch(e => next(e));
}

/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res, next) {
  const user = req.user;
  if (user._id.equals(req.currentUser._id)) {
    user.remove()
      .then(deletedUser => {
        console.info('Deleted User:', deletedUser);
        res.json(deletedUser)
      })
      .catch(e => next(e));
  } else {
    res.send({
      status: httpStatus.BAD_REQUEST,
      error: 'Unable to remove other user!'
    });
  }
}

export default { load, get, create, update, list, remove };
