import { Sequelize } from 'sequelize-typescript';
import { Sequence } from './sequence';
import { UserList } from './userList';
import { BuddyList } from './buddyList';
import { UserLoginHstr } from './userLoginHstr';
import { BroadcastMessage } from './broadcastMessage';
import { DirectMessage } from './directMessage';

import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize({
  host: process.env.J_HOST,
  database: process.env.J_DATABASE,
  dialect: 'mysql',
  username: process.env.J_USERNAME,
  password: process.env.J_PASSWORD,
  define: {
    freezeTableName: true
  }
});

sequelize.addModels([Sequence, UserList, BuddyList, UserLoginHstr, BroadcastMessage, DirectMessage]);
