import { Field, ID, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from "typeorm";
import { Challenge } from "./Challenge";
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

  @Column({ default: false })
  @Field()
  isAccepted!: boolean;

  @ManyToOne(() => User, (user) => user.userToChallenges)
  @Field(() => User)
  user!: User;

  @ManyToOne(() => Challenge, (challenge) => challenge.userToChallenges)
  @Field(() => Challenge)
  challenge!: Challenge;
}

// Class de d'écriture TypeGraphQL,
// plus besoin de TypeORM et des champs nécéssaire à la lecture
// Ajout de la validation des champs avec class-validator

// @InputType()
// export class UpdateUserToChallengeInput {
//   @Field()
//   isAccepted: boolean;
// }
