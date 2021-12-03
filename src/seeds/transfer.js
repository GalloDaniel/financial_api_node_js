
exports.seed = (knex) => {
  return knex('transactions').del()
    .then(() => knex('transfers').del())
    .then(() => knex('accounts').del())
    .then(() => knex('users').del())
    .then(() => knex('users').insert([
      { id: 10000, name: 'User #1', mail: 'user@mail.com', passwd: '$2a$10$c6MRXRY4eHQT4peiH7i45O.nP3mdp2muCz5geD4J9DtJhitf.xy/S' },
      { id: 10001, name: 'User #2', mail: 'use2r@mail.com', passwd: '$2a$10$c6MRXRY4eHQT4peiH7i45O.nP3mdp2muCz5geD4J9DtJhitf.xy/S' },
    ]))
    .then(() => knex('accounts').insert([
      { id: 10000, name: 'Acc0 #1', user_id: 10000 },
      { id: 10001, name: 'AccD #1', user_id: 10000 },
      { id: 10002, name: 'Acc0 #2', user_id: 10001 },
      { id: 10003, name: 'AccD #2', user_id: 10001 },
    ]))
    .then(() => knex('transfers').insert([
      { id: 10000, description: 'Transfer #1', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, amount: 100, date: new Date() },
      { id: 10001, description: 'Transfer #2', user_id: 10001, acc_ori_id: 10002, acc_dest_id: 10003, amount: 100, date: new Date() },
    ]))
    .then(() => knex('transactions').insert([
      { description: 'Transfer from AccO #1', date: new Date(), amount: 100, type: 'I', acc_id: 10001, transfer_id: 10000 },
      { description: 'Transfer to AccO #1', date: new Date(), amount: -100, type: 'O', acc_id: 10000, transfer_id: 10000 },
      { description: 'Transfer from AccO #2', date: new Date(), amount: 100, type: 'I', acc_id: 10003, transfer_id: 10001 },
      { description: 'Transfer to AccO #2', date: new Date(), amount: -100, type: 'O', acc_id: 10002, transfer_id: 10001 },
    ]));
};
