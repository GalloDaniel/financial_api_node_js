const request = require('supertest');
const moment = require('moment');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/balance';
const ROUTE_TRANSACTION = '/v1/transactions';
const ROUTE_TRANSFER = '/v1/transfers';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMTAwIiwibmFtZSI6IlVzZXIgIzMiLCJpYXQiOiJ1c2VyM0BtYWlsLmNvbSJ9.WHFL6xquw3999mgWLqLRv2FjnrFKmujNMNqWaQEWq_U';
const TOKEN_GERAL = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMTAyIiwibmFtZSI6IlVzZXIgIzUiLCJtYWlsIjoidXNlcjVAbWFpbC5jb20ifQ.x3AR3oMTkHahePVP-n5LoWmBeqKJ88NFvCz7GVuvSs0';

beforeAll(async () => {
  await app.db.seed.run();
});

describe('Ao calcular o saldo do usuário...', () => {
  test('Deve retornar apensar as contas com alguma transação', () => {
    return request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
      });
  });

  test('Deve adicionar valores de entrada', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ description: '1', date: new Date(), amount: 100, type: 'I', acc_id: 10100, status: true })
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('100.00');
          });
      });
  });

  test('Deve subtrair valores de saida', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ description: '1', date: new Date(), amount: 200, type: 'O', acc_id: 10100, status: true })
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
          });
      });
  });

  test('Não deve considerar transações pendentes', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ description: '1', date: new Date(), amount: 100, type: 'I', acc_id: 10100, status: false })
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
          });
      });
  });

  test('Não deve considerar saldo de contas distintas', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ description: '1', date: new Date(), amount: 50, type: 'I', acc_id: 10101, status: true })
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
            expect(res.body[1].id).toBe(10101);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });

  test('Não deve considerar contas de outro usuário', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ description: '1', date: new Date(), amount: 200, type: 'O', acc_id: 10102, status: true })
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
            expect(res.body[1].id).toBe(10101);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });

  test('Deve considerar trasação passada', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ description: '1', date: moment().subtract({ days: 5 }), amount: 250, type: 'I', acc_id: 10100, status: true })
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('150.00');
            expect(res.body[1].id).toBe(10101);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });

  test('Não deve considerar uma transação futura', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ description: '1', date: moment().add({ days: 5 }), amount: 250, type: 'I', acc_id: 10100, status: true })
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('150.00');
            expect(res.body[1].id).toBe(10101);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });

  test('Deve considerar transferências', () => {
    return request(app).post(ROUTE_TRANSFER)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ description: '1', date: new Date(), amount: 250, acc_ori_id: 10100, acc_dest_id: 10101 })
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
            expect(res.body[1].id).toBe(10101);
            expect(res.body[1].sum).toBe('300.00');
          });
      });
  });

  test('Deve calcular saldo das contas do usuário', () => {
    return request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN_GERAL}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].id).toBe(10104);
        expect(res.body[0].sum).toBe('162.00');
        expect(res.body[1].id).toBe(10105);
        expect(res.body[1].sum).toBe('-248.00');
      });
  });
});
