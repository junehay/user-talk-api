import { Table, Column, Model, AllowNull, DataType, PrimaryKey, Unique, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table
export class Sequence extends Model<Sequence> {
  @PrimaryKey
  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.STRING(4)
  })
  seq_name!: string;

  @AllowNull(false)
  @Column({
    type: DataType.INTEGER
  })
  seq_no!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
