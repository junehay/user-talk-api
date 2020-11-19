import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, HasMany } from 'sequelize-typescript';
import { UserList } from './userList';
import { DirectMessage } from './directMessage';

@Table({ createdAt: false, updatedAt: false, tableName: 'buddy_list' })
export class BuddyList extends Model<BuddyList> {
  @PrimaryKey
  @ForeignKey(() => UserList)
  @Column({
    type: DataType.STRING(10)
  })
  intt_id!: string;

  @PrimaryKey
  @Column({
    type: DataType.STRING(10)
  })
  bd_intt_id!: string;

  @HasMany(() => DirectMessage)
  directMessages?: DirectMessage[];
}
