const request = require('supertest');
const app = require('../app');
const { sequelize, Contact } = require('../models');

describe('POST /identify', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await Contact.destroy({ where: {}, force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('returns 400 when neither email nor phoneNumber provided', async () => {
    const res = await request(app)
      .post('/identify')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email|phoneNumber|required/i);
  });

  test('creates primary contact when only email provided and no match', async () => {
    const res = await request(app)
      .post('/identify')
      .send({ email: 'a@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.contact.primaryContatctId).toBeDefined();
    expect(res.body.contact.emails).toEqual(['a@example.com']);
    expect(res.body.contact.phoneNumbers).toEqual([]);
    expect(res.body.contact.secondaryContactIds).toEqual([]);
  });

  test('creates primary contact when only phoneNumber provided and no match', async () => {
    const res = await request(app)
      .post('/identify')
      .send({ phoneNumber: '+1234567890' });
    expect(res.status).toBe(200);
    expect(res.body.contact.primaryContatctId).toBeDefined();
    expect(res.body.contact.emails).toEqual([]);
    expect(res.body.contact.phoneNumbers).toEqual(['+1234567890']);
    expect(res.body.contact.secondaryContactIds).toEqual([]);
  });

  test('creates secondary when same email already exists', async () => {
    const first = await request(app)
      .post('/identify')
      .send({ email: 'b@example.com' });
    expect(first.status).toBe(200);
    const primaryId = first.body.contact.primaryContatctId;
    const second = await request(app)
      .post('/identify')
      .send({ email: 'b@example.com', phoneNumber: '+1111111111' });
    expect(second.status).toBe(200);
    expect(second.body.contact.primaryContatctId).toBe(primaryId);
    expect(second.body.contact.secondaryContactIds.length).toBe(1);
    expect(second.body.contact.emails).toContain('b@example.com');
    expect(second.body.contact.phoneNumbers).toContain('+1111111111');
  });

  test('duplicate request does not create new row', async () => {
    const first = await request(app)
      .post('/identify')
      .send({ email: 'c@example.com', phoneNumber: '+2222222222' });
    expect(first.status).toBe(200);
    const countAfterFirst = await Contact.count();
    const second = await request(app)
      .post('/identify')
      .send({ email: 'c@example.com', phoneNumber: '+2222222222' });
    expect(second.status).toBe(200);
    const countAfterSecond = await Contact.count();
    expect(countAfterSecond).toBe(countAfterFirst);
  });

  test('merges two primaries and keeps oldest as primary', async () => {
    const first = await request(app)
      .post('/identify')
      .send({ email: 'd@example.com' });
    expect(first.status).toBe(200);
    const primaryIdA = first.body.contact.primaryContatctId;
    const second = await request(app)
      .post('/identify')
      .send({ phoneNumber: '+3333333333' });
    expect(second.status).toBe(200);
    const primaryIdB = second.body.contact.primaryContatctId;
    const third = await request(app)
      .post('/identify')
      .send({ email: 'd@example.com', phoneNumber: '+3333333333' });
    expect(third.status).toBe(200);
    expect(third.body.contact.primaryContatctId).toBe(primaryIdA);
    expect(third.body.contact.secondaryContactIds).toContain(primaryIdB);
    expect(third.body.contact.emails).toContain('d@example.com');
    expect(third.body.contact.phoneNumbers).toContain('+3333333333');
  });
});
