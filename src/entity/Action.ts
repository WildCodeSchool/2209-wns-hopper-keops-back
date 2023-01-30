import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  // OneToMany,
  ManyToOne,
  ManyToMany,
} from "typeorm";
import { Challenge } from "./Challenge";
import { User } from "./User";

// Création et gestion du schema de donnée de wilder TypeORM
// Class de lecture TypeGraphQL

@Entity()
@ObjectType()
export class Action {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  title: string;

  @Column()
  @Field()
  description: string;

  @Column({ default: 100 })
  @Field()
  sucessValue: number;

  @Column({ default: new Date() })
  @Field()
  createdAt: Date;

  // User
  @ManyToOne(() => User)
  @Field(() => User)
  createdBy: User;

  @Column({ default: null })
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  // User
  @ManyToOne(() => User)
  @Field(() => User, { nullable: true })
  updatedBy: User;

  @ManyToMany(() => Challenge, (challenge) => challenge.actions)
  @Field(() => [Challenge])
  challenges: Challenge[];

  // @OneToMany(
  //   () => UserToChallenge,
  //   (userToChallenge) => userToChallenge.challenge
  // )
  // @Field(() => [UserToChallenge])
  // userToChallenges: UserToChallenge[];
}

// Class de d'écriture TypeGraphQL,
// plus besoin de TypeORM et des champs nécéssaire à la lecture
// Ajout de la validation des champs avec class-validator

// @InputType()
// export class ActionToChallengeInput {
//   challenges: ManyRelations;
// }

@InputType()
export class ActionInput {
  @Field()
  title: string;

  @Field()
  description: string;

  createdBy: User;
}
