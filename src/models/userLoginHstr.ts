import { Table, Column, Model, DataType, ForeignKey, CreatedAt } from 'sequelize-typescript';
import { UserList } from './userList';

@Table({ updatedAt: false, tableName: 'user_login_hstr' })
export class UserLoginHstr extends Model<UserLoginHstr> {
  @ForeignKey(() => UserList)
  @Column({
    type: DataType.STRING(10)
  })
  intt_id!: string;

  @Column({
    type: DataType.STRING(1024)
  })
  login_hdr!: string;

  @CreatedAt
  createdAt!: Date;
}
