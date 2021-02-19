import { StatusCodes } from 'http-status-codes';
import supertest from 'supertest';
import { assert } from 'chai';
import { Application } from 'express';
import { v4 as uuid } from 'uuid';

import { getApp } from '../../../src/app';
import { getTestContext } from '../../lib/test-context';

describe('User API Routes', () => {
  let app: Application;

  before(async () => {
    const context = await getTestContext();
    app = getApp(context);
  });

  it('Can create user with post', async () => {
    const testNewUser = {
      name: 'john',
      email: `new-user-test-${uuid()}@test.com`,
      username: 'newuser123',
      password: 'Password123!',
    };

    const res = await supertest(app)
      .post('/api/v1/users')
      .send(testNewUser)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK);

    const body = JSON.parse(res.text);
    assert.isNumber(body.id);
    assert.equal(body.name, testNewUser.name);
    assert.equal(body.email, testNewUser.email);
    assert.equal(body.username, testNewUser.username);
    assert.isNull(body.archivedAt);
    assert.isNull(body.bannedAt);
    assert.isTrue(new Date(body.createdAt).toISOString() === body.createdAt);
    assert.isTrue(new Date(body.updatedAt).toISOString() === body.updatedAt);
  });

  it('returns bad request when required values are not passed ', async () => {
    const res = await supertest(app)
      .post('/api/v1/users')
      .send({})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST);

    const body = JSON.parse(res.text);
    assert.deepEqual(body, [
      {
        message: '"name" is required',
        slug: 'new-user-name-any-required',
        type: 'validation',
      },
      {
        message: '"email" is required',
        slug: 'new-user-email-any-required',
        type: 'validation',
      },
      {
        message: '"username" is required',
        slug: 'new-user-username-any-required',
        type: 'validation',
      },
      {
        message: '"password" is required',
        slug: 'new-user-password-any-required',
        type: 'validation',
      },
    ]);
  });

  it('returns bad request when email already exists', async () => {
    const testNewUser = {
      name: 'john',
      email: `new-user-test-${uuid()}@test.com`,
      username: 'newuser123',
      password: 'Password123!',
    };
    await supertest(app)
      .post('/api/v1/users')
      .send(testNewUser)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK);

    const res = await supertest(app)
      .post('/api/v1/users')
      .send(testNewUser)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST);

    const body = JSON.parse(res.text);
    assert.deepEqual(body, [
      {
        message: `Email ${testNewUser.email} already exists`,
        slug: 'new-user-email-already-used',
        type: 'validation',
      },
    ]);
  });
});
