'use strict';

const supertest = require('supertest');
const assert = require('chai').assert;
const { some } = require('lodash');
const sinon = require('sinon');

const { getTestApp, db } = require('../../app');
const { cleanData } = require('../../lib/db');
const userData = require('../../../data/user');

describe('/auth', () => {
  let app;
  let sandbox;

  before(async () => {
    app = await getTestApp();
    sandbox = sinon.createSandbox();
    await cleanData(db);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('/auth/signup', () => {
    it('returns error when missing email and password', () =>
      supertest(app)
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send({})
        .expect(400)
        .then(res => {
          assert.exists(res.body.errors);
          assert.isArray(res.body.errors);
          assert.equal(
            some(res.body.errors, { slug: 'signup-email-is-requied' }),
            true,
            'missing email required error',
          );
          assert.equal(
            some(res.body.errors, { slug: 'signup-password-is-requied' }),
            true,
            'missing password required error',
          );
        }));

    it('returns error when password missing requirements', () =>
      supertest(app)
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send({
          email: 'jtwebman+test@gmail.com',
          password: '!',
        })
        .expect(400)
        .then(res => {
          assert.exists(res.body.errors);
          assert.isArray(res.body.errors);
          assert.equal(
            some(res.body.errors, { slug: 'signup-password-min-length-8' }),
            true,
            'missing password length error',
          );
          assert.equal(
            some(res.body.errors, { slug: 'signup-password-at-least-one-uppercase-character' }),
            true,
            'missing password needing one uppercase char error',
          );
          assert.equal(
            some(res.body.errors, { slug: 'signup-password-at-least-one-lowercase-character' }),
            true,
            'missing password needing one lowercase char error',
          );
          assert.equal(
            some(res.body.errors, { slug: 'signup-password-at-least-one-number-character' }),
            true,
            'missing password needing one number char error',
          );
        }));

    it('returns user record on success', () =>
      supertest(app)
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send({
          email: 'jtwebman+test-signup-1@gmail.com',
          password: 'Password123!',
        })
        .expect(200)
        .then(res => {
          assert.hasAllKeys(res.body, [
            'id',
            'createAt',
            'updatedAt',
            'email',
            'emailVerified',
            'archivedAt',
            'bannedAt',
          ]);
          assert.isString(res.body.id);
          assert.isString(res.body.createAt);
          assert.isNotEmpty(res.body.createAt);
          assert.isString(res.body.updatedAt);
          assert.isNotEmpty(res.body.updatedAt);
          assert.equal(res.body.email, 'jtwebman+test-signup-1@gmail.com');
          assert.equal(res.body.emailVerified, false);
          assert.isNull(res.body.archivedAt);
          assert.isNull(res.body.bannedAt);
        }));

    it('returns error if email already exists', () =>
      supertest(app)
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send({
          email: 'jtwebman+test-signup-1@gmail.com',
          password: 'Password123!',
        })
        .expect(400)
        .then(res => {
          assert.exists(res.body.errors);
          assert.isArray(res.body.errors);
          assert.equal(
            some(res.body.errors, { slug: 'signup-email-already-exists' }),
            true,
            'missing email already exists error',
          );
        }));

    it('returns 500 error on unknown error', () => {
      sandbox.stub(userData, 'insertUser').rejects(new Error('Unknow DB error'));
      return supertest(app)
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send({
          email: 'jtwebman+test-signup-2@gmail.com',
          password: 'Password123!',
        })
        .expect(500)
        .then(res => {
          assert.exists(res.body.errors);
          assert.isArray(res.body.errors);
          assert.equal(some(res.body.errors, { slug: 'unknown-error' }), true, 'missing unknown error');
        });
    });
  });
});
