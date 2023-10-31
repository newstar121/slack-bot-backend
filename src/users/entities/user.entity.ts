import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { UserStatuses } from '../../common/app.constants'
import { SubscriptionEntity } from '../../payments/entities/subscription.entity'

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: null })
  first_name: string

  @Column({ default: null })
  last_name: string

  @Column({ nullable: false, unique: true })
  email: string

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)'
  })
  date_created: Date

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)'
  })
  public date_updated: Date

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
    nullable: true
  })
  public date_subscribed: Date

  @Column({ default: UserStatuses.free })
  status: UserStatuses

  @OneToMany(() => SubscriptionEntity, subscription => subscription.user)
  subscriptions: SubscriptionEntity[]
}
