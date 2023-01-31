import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Action } from "./Action";
import { UniqueRelation } from "./common";
import { User } from "./User";
import { UserToChallenge } from "./UserToChallenge";

// Création et gestion du schema de donnée de wilder TypeORM
// Class de lecture TypeGraphQL

@Entity()
@ObjectType()
export class Challenge {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  name: string;

  @Column()
  @Field()
  length: number;

  @Column()
  @Field(() => Date)
  start_date: Date;

  // A modifier pour renvoyer la date de fin du challenge
  @Field()
  get end_date(): Date {
    return new Date();
  }

  @Column({ default: false })
  @Field()
  is_in_progress: boolean;

  @Column()
  @Field()
  createdAt: Date;

  // User
  @ManyToOne(() => User)
  @Field(() => User)
  createdBy: User;

  @Column({ default: null })
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  @ManyToMany(() => Action, (action) => action.challenges, {
    onUpdate: "CASCADE",
  })
  @Field(() => [Action])
  @JoinTable()
  actions: Action[];

  // User
  @ManyToOne(() => User)
  @Field(() => User, { nullable: true })
  updatedBy: User;

  @OneToMany(
    () => UserToChallenge,
    (userToChallenge) => userToChallenge.challenge
  )
  @Field(() => [UserToChallenge])
  userToChallenges: UserToChallenge[];
}

// Class de d'écriture TypeGraphQL,
// plus besoin de TypeORM et des champs nécéssaire à la lecture
// Ajout de la validation des champs avec class-validator

@InputType()
export class ActionToChallengeInput {
  @Field(() => [UniqueRelation])
  actions: UniqueRelation[];
}

@InputType()
export class ChallengeInput {
  @Field()
  length: number;

  @Field(() => Date)
  start_date: Date;

  @Field()
  name: string;

  createdAt: Date;
  createdBy: User;
}

@InputType()
export class CreateChallengeInput {
  @Field()
  length: number;

  @Field(() => Date)
  start_date: Date;

  @Field()
  name: string;

  @Field(() => ActionToChallengeInput)
  actions: ActionToChallengeInput;

  createdAt: Date;
  createdBy: User;
}