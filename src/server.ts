import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { sequelize } from './models';
import logger, { stream } from './config/logger';
import api from './routes/api';

dotenv.config();

const app: Application = express();

sequelize
  .sync()
  .then(() => console.log('connected to db'))
  .catch((err) => {
    console.log(err);
  });

// middleware
if (process.env.NODE_ENV === 'production') {
  app.use(helmet()); // 요구사항 5 ('X-Powered-By' 헤더 필드 제거는 helmet에 내장)
  app.use(morgan(':method :url :remote-addr :user-agent', { stream: stream })); // 요구사항 3
} else {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '2kb' })); // 요구사항 4
app.use(express.urlencoded({ extended: false, limit: '2kb' })); // 요구사항 4
app.use(cookieParser(process.env.SECRET_KEY));

// router
app.use('/api', api);

// error
app.use((req: Request, res: Response) => {
  res.status(404).json('ERR_NOT_FOUND');
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);
  res.status(500).json({
    message: err.message || 'ERR_UNKNOWN_ERROR'
  });
});

// server
const options = {
  host: process.env.NODE_HOST || 'localhost',
  port: process.env.NODE_PORT || 3001
};

app.listen(options, () => console.log(`server on!!! ${options.host}:${options.port}`));
