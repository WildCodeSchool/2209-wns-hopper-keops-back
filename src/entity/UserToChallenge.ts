import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from "typeorm";
import { Challenge } from "./Challenge";
import { UniqueRelation } from "./common";
import { User } from "./User";

// Création et gestion du schema de donnée de wilder TypeORM
// Class de lecture TypeGraphQL

@Entity()
@ObjectType()
// Check if userToChallenge is unique (one challenge for one user)
@Index(["user", "challenge"], { unique: true })
export class UserToChallenge {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Column({ default: true })
  @Field()
  isAccepted!: boolean;

  @Column({ default: 0 })
  @Field()
  challengeScore!: number;

  @ManyToOne(() => User, (user) => user.userToChallenges, {
    onUpdate: "CASCADE",
  })
  @Field(() => User)
  user!: User;

  @ManyToOne(() => Challenge, (challenge) => challenge.userToChallenges, {
    onUpdate: "CASCADE",
  })
  @Field(() => Challenge)
  challenge!: Challenge;
}

// Class de d'écriture TypeGraphQL,
// plus besoin de TypeORM et des champs nécéssaire à la lecture
// Ajout de la validation des champs avec class-validator

@InputType()
export class UserToChallengeInput {
  @Field()
  isAccepted: boolean;

  @Field(() => UniqueRelation)
  challenge: UniqueRelation;

  // non modifiable depuis le front
  user: User;
}

@InputType()
export class RemoveUserToChallengeInput {
  @Field(() => ID)
  userToChallengeId: string;
}
