import supertest from 'supertest';
import { assert } from 'chai';
import { Application } from 'express';

import { getStatusApp } from '../../src/status';

describe('private status check', () => {
  let app: Application;

  before(async () => {
    app = getStatusApp();
  });

  it('returns OK', () =>
    supertest(app)
      .get('/status')
      .expect(200)
      .then((res) => {
        assert.equal(res.text, 'OK');
      }));
});
