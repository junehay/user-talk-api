import { Table, Column, Model, AllowNull, DataType, CreatedAt, UpdatedAt, PrimaryKey, Unique, BeforeCreate, AfterCreate, HasMany } from 'sequelize-typescript';
import { Sequence } from './sequence';
import { BuddyList } from './buddyList';
import { UserLoginHstr } from './userLoginHstr';
import { BroadcastMessage } from './broadcastMessage';
import { DirectMessage } from './directMessage';

const seqName = 'USER';
@Table({ tableName: 'user_list' })
export class UserList extends Model<UserList> {
  @PrimaryKey
  @Column({
    type: DataType.STRING(10)
  })
  intt_id!: string;

  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.STRING(50)
  })
  user_id!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(64)
  })
  user_pw!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(30)
  })
  user_nm!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(1)
  })
  user_stts!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @HasMany(() => BuddyList)
  buddyLists?: BuddyList[];

  @HasMany(() => UserLoginHstr)
  userLoginHstrs?: UserLoginHstr[];

  @HasMany(() => BroadcastMessage)
  broadcastMessages?: BroadcastMessage[];

  @HasMany(() => DirectMessage)
  directMessages?: DirectMessage[];

  @BeforeCreate
  static async setSequence(instance: UserList): Promise<void> {
    const seq = await Sequence.findOne({
      where: {
        seq_name: seqName
      },
      raw: true
    });
    if (!seq) {
      await Sequence.create({
        seq_name: seqName,
        seq_no: 0
      });
      instance.intt_id = `${seqName}000001`;
    } else {
      const seq_no = seq?.seq_no;
      instance.intt_id = `${seqName}${String(seq_no + 1).padStart(6, '0')}`;
    }
  }

  @AfterCreate
  static async updateSequence(): Promise<void> {
    await Sequence.increment(
      {
        seq_no: 1
      },
      {
        where: {
          seq_name: seqName
        }
      }
    );
  }
}
