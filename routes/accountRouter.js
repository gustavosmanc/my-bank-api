import express from 'express';

import { accountModel } from '../models/account.js';

const app = express();

// 4
app.put('/account/updateBalance', async (req, res) => {
  const agencia = req.body.agencia;
  const conta = req.body.conta;
  const value = req.body.value;

  try {
    const account = await accountModel.findOneAndUpdate(
      { agencia, conta },
      { $inc: { balance: value } },
      { new: true }
    );

    if (account === null) {
      res.status(404).send('Conta não encontrada!');
      return;
    }

    res.send({ balance: account.balance });
  } catch (err) {
    res.status(500).send(err);
  }
});

//5
app.put('/account/getMoney', async (req, res) => {
  const agencia = req.body.agencia;
  const conta = req.body.conta;
  const value = req.body.value;

  try {
    const foundAccount = await accountModel.findOne({ agencia, conta });

    if (!foundAccount) {
      res.status(404).send('Conta não encontrada!');
      return;
    }

    if (foundAccount.balance < value + 1) {
      res.status(404).send('Saldo insuficiente!');

      return;
    }

    const account = await accountModel.findOneAndUpdate(
      { agencia, conta },
      { $inc: { balance: -(value + 1) } },
      { new: true }
    );

    res.send({ balance: account.balance });
  } catch (err) {
    res.status(500).send(err);
  }
});

// 6
app.get('/account/accountBalance', async (req, res) => {
  const agencia = req.body.agencia;
  const conta = req.body.conta;

  try {
    const account = await accountModel.find({ agencia, conta });

    if (account.length === 0) {
      res.status(404).send('Conta não encontrada!');
      return;
    }

    res.send(account);
  } catch (err) {
    res.status(500).send(err);
  }
});

// 7
app.delete('/account/deleteAccount', async (req, res) => {
  const agencia = req.body.agencia;
  const conta = req.body.conta;

  console.log(agencia);

  try {
    await accountModel.findOneAndDelete({ agencia, conta });
    const agenciasCount = await accountModel.find({ agencia }).count();

    res.send({ contasAgencia: agenciasCount });
  } catch (err) {
    res.status(500).send(err);
  }
});

// 8
app.put('/account/transfer', async (req, res) => {
  const origin = req.body.origin;
  const destination = req.body.destination;
  const value = req.body.value;

  try {
    const { agencia: originAgency } = await accountModel.findOne(
      { conta: origin },
      { _id: 0, agencia: 1 }
    );

    const { agencia: destinationAgency } = await accountModel.findOne(
      { conta: destination },
      { _id: 0, agencia: 1 }
    );

    let fee = 0;

    if (originAgency !== destinationAgency) {
      fee = 8;
    }

    const result = await accountModel.findOneAndUpdate(
      {
        agencia: originAgency,
        conta: origin,
      },
      { $inc: { balance: -(value + fee) } },
      { new: true }
    );

    await accountModel.findOneAndUpdate(
      {
        agencia: destinationAgency,
        conta: destination,
      },
      {
        $inc: { balance: value },
      }
    );

    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

// 9
app.get('/account/averageBalance/:agencia', async (req, res) => {
  const agencia = req.params.agencia;

  try {
    const agencias = await accountModel.find({ agencia }, { balance: 1 });
    const agenciasCount = await accountModel.find({ agencia }).count();

    const average = agencias.reduce((acc, curr) => {
      return acc + curr.balance;
    }, 0);

    res.send({ media: average / agenciasCount });
  } catch (err) {
    res.status(500).send(err);
  }
});

// 10
app.get('/account/lowestBalance/:amount', async (req, res) => {
  const amount = parseInt(req.params.amount);

  try {
    const people = await accountModel
      .find({}, { _id: 0, agencia: 1, conta: 1, balance: 1 })
      .limit(amount)
      .sort({ balance: 1 });

    res.send(people);
  } catch (err) {
    res.status(500).send(err);
  }
});

// 11
app.get('/account/highestBalance/:amount', async (req, res) => {
  const amount = parseInt(req.params.amount);

  try {
    const people = await accountModel
      .find({}, { _id: 0, agencia: 1, conta: 1, name: 1, balance: 1 })
      .limit(amount)
      .sort({ balance: -1, name: 1 });

    res.send(people);
  } catch (err) {
    res.status(500).send(err);
  }
});

// 12
app.put('/account/updateHighestBalance', async (_, res) => {
  try {
    const agencies = await accountModel.distinct('agencia');

    for (const agency of agencies) {
      const richest = await accountModel
        .findOne(
          { agencia: agency },
          { _id: 0, agencia: 1, conta: 1, name: 1, balance: 1 }
        )
        .limit(1)
        .sort({ balance: -1, name: 1 });

      await accountModel.findOneAndUpdate(
        { agencia: agency, conta: richest.conta },
        { agencia: 99 }
      );
    }

    const people = await accountModel.find({ agencia: 99 });

    res.send(people);
  } catch (err) {
    res.status(500).send(err);
  }
});

export { app as accountRouter };
