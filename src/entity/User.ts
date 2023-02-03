import { IsEmail, Length } from "class-validator";
import {
  Field,
  ID,
  InputType,
  MiddlewareFn,
  ObjectType,
  UseMiddleware,
} from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { IContext } from "../auth";
import { UserToChallenge } from "./UserToChallenge";

// Création et gestion du schema de donnée de wilder TypeORM
// Class de lecture TypeGraphQL

// root is the parent entity
// context contains the connected user
export const IsUser: MiddlewareFn<IContext> = async (
  { root, context },
  next
) => {
  if (root.id === context.me?.id) {
    return await next();
  }
};

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
  @UseMiddleware(IsUser)
  password: string;

  @Column({ unique: true })
  @Field()
  @UseMiddleware(IsUser)
  email: string;

  @Column({ default: new Date() })
  @Field()
  @UseMiddleware(IsUser)
  createdAt: Date;

  @Column({ default: new Date() })
  @Field()
  @UseMiddleware(IsUser)
  updatedAt: Date;

  @Column({ default: false })
  @Field()
  isAdmin: boolean;

  @Column({ default: false })
  @Field()
  @UseMiddleware(IsUser)
  isCompany: boolean;

  @Column({ default: 0 })
  @Field()
  score: number;

  @OneToMany(() => UserToChallenge, (userToChallenge) => userToChallenge.user)
  @Field(() => [UserToChallenge])
  @UseMiddleware(IsUser)
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
