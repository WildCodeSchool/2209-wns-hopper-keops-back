import { IsEmail, Length } from "class-validator";
import { Field, ID, InputType, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { UserToChallenge } from "./UserToChallenge";

// Création et gestion du schema de donnée de wilder TypeORM
// Class de lecture TypeGraphQL

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Column({ default: "User" })
  @Field()
  name: string;

  @Column()
  @Field()
  password: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column({ default: new Date() })
  @Field()
  createdAt: Date;

  @Column({ default: new Date() })
  @Field()
  updatedAt: Date;

  @Column({ default: false })
  @Field()
  isAdmin: boolean;

  @Column({ default: false })
  @Field()
  isCompany: boolean;

  @Column({ default: 0 })
  @Field()
  score: number;

  @OneToMany(() => UserToChallenge, (userToChallenge) => userToChallenge.user)
  @Field(() => [UserToChallenge])
  userToChallenges: UserToChallenge[];
}

// Class de d'écriture TypeGraphQL,
// plus besoin de TypeORM et des champs nécéssaire à la lecture
// Ajout de la validation des champs avec class-validator

@InputType()
export class UserInput {
  @Field()
  @Length(8, 60)
  password: string;

  @Field()
  @IsEmail()
  email: string;
}

@InputType()
export class UpdateUserInput {
  @Field()
  @Length(2, 60)
  name: string;

  @Field()
  @IsEmail()
  email: string;
}
