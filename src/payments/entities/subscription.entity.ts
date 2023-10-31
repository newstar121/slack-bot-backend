import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UserEntity } from '../../users/entities/user.entity'
import { JoinColumn } from 'typeorm'

@Entity({ name: 'subscriptions' })
export class SubscriptionEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  customer_id: string

  @Column()
  subscription_id: string

  @Column()
  customer_email: string

  @Column()
  interval: string

  @Column()
  amount: number

  @Column()
  status: string

  @Column()
  current_period_start: Date

  @Column()
  current_period_end: Date

  @Column({ nullable: true })
  canceled_at: Date

  @Column({ nullable: true })
  ended_at: Date

  @ManyToOne(() => UserEntity, user => user.subscriptions)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
