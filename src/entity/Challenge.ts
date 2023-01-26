import { Field, ID, InputType, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
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

  @Column({ default: new Date() })
  @Field()
  createdAt: Date;

  // User
  @ManyToOne(() => User)
  @Field(() => User)
  createdBy: User;

  @Column({ default: new Date() })
  @Field(() => Date)
  updatedAt: Date;

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
export class ChallengeInput {
  @Field()
  length: number;

  @Field(() => Date)
  start_date: Date;
}
