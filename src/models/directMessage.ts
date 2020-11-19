import { Table, Column, Model, DataType, ForeignKey, AllowNull, CreatedAt } from 'sequelize-typescript';
import { UserList } from './userList';
import { BuddyList } from './buddyList';

@Table({ updatedAt: false, tableName: 'direct_message' })
export class DirectMessage extends Model<DirectMessage> {
  @ForeignKey(() => UserList)
  @Column({
    type: DataType.STRING(10)
  })
  intt_id!: string;

  @ForeignKey(() => BuddyList)
  @Column({
    type: DataType.STRING(10)
  })
  bd_intt_id!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(1024)
  })
  message!: string;

  @CreatedAt
  createdAt!: Date;
}
