import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import app from '../../index';

chai.config.includeStack = true;

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe('## User APIs', () => {

  let authorization;
  let user = {
    email: 'a@test.com',
    username: 'TestUser',
    password: 'testPassword'
  };

  let userObj;

  describe('# POST /api/users, POST /api/auth/login', () => {
    it('should create a new user', (done) => {
      request(app)
        .post('/api/users')
        .send(user)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.email).to.equal(user.email);
          expect(res.body.username).to.equal(user.username);
          userObj = res.body;
          done();
        })
        .catch(done);
    });

    it('should login', (done) => {
      request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: user.password
        })
        .expect(httpStatus.OK)
        .then((res) => {
          authorization = res.body.token;
          expect(res.body.user.email).to.equal(user.email);
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/users/:userId', () => {
    it('should get user details', (done) => {
      request(app)
        .get(`/api/users/${userObj._id}`)
        .set({
          authorization
        })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).to.equal(user.username);
          expect(res.body.email).to.equal(user.email);
          done();
        })
        .catch(done);
    });

    it('should report error with message - Not found, when user does not exists', (done) => {
      request(app)
        .get('/api/users/56c787ccc67fc16ccc1a5e92')
        .set({
          authorization
        })
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.error).to.equal('Not Found');
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/users/:userId', () => {
    it('should update user details', (done) => {
      user.username = 'EditedUserName';
      request(app)
        .put(`/api/users/${userObj._id}`)
        .set({
          authorization
        })
        .send(user)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).to.equal(user.username);
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/users/', () => {
    it('should get all users', (done) => {
      request(app)
        .get('/api/users')
        .set({
          authorization
        })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    it('should get all users (with limit and skip)', (done) => {
      request(app)
        .get('/api/users')
        .set({
          authorization
        })
        .query({ limit: 10, skip: 1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/users/', () => {
    it('should delete user', (done) => {
      request(app)
        .delete(`/api/users/${userObj._id}`)
        .set({
          authorization
        })
        .expect(httpStatus.OK)
        .then((res) => {
          console.info('Delete User:', res.body);
          expect(res.body.username).to.equal(user.username);
          expect(res.body.email).to.equal(user.email);
          done();
        })
        .catch(done);
    });
  });
});
