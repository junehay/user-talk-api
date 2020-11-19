import { Table, Column, Model, DataType, ForeignKey, AllowNull, CreatedAt } from 'sequelize-typescript';
import { UserList } from './userList';

@Table({ updatedAt: false, tableName: 'broadcast_message' })
export class BroadcastMessage extends Model<BroadcastMessage> {
  @ForeignKey(() => UserList)
  @Column({
    type: DataType.STRING(10)
  })
  intt_id!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(1024)
  })
  message!: string;

  @CreatedAt
  createdAt!: Date;
}
