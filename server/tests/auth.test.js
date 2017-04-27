import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import chai, { expect } from 'chai';
import app from '../../index';
import config from '../../config/config';

chai.config.includeStack = true;

describe('## Auth APIs', () => {
  const validUserCredentials = {
    email: 'test@test.com',
    password: 'express'
  };

  const invalidUserCredentials = {
    email: 'test@test.com',
    password: 'invalidPassword'
  };

  describe('# POST /api/auth/login', () => {
    it('should return Authentication error', (done) => {
      request(app)
        .post('/api/auth/login')
        .send(invalidUserCredentials)
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          console.info('Auth error:', res.body);
          expect(res.body.error).to.equal('Authentication error');
          done();
        })
        .catch(done);
    });
  });

});
