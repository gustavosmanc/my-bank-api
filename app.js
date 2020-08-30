import express from 'express';
import mongoose from 'mongoose';

mongoose.set('useFindAndModify', false);

import dotenv from 'dotenv';
dotenv.config();

import { accountRouter } from './routes/accountRouter.js';

const app = express();

(async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://' +
        process.env.USERDB +
        ':' +
        process.env.PWDDB +
        '@bootcamp.3ccpy.mongodb.net/desafio?retryWrites=true&w=majority',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('Conectado no MongoDB');
  } catch (error) {
    console.log(error);
  }
})();

app.use(express.json());
app.use(accountRouter);

app.listen(process.env.PORT, () => console.log('Servidor em execucao'));
