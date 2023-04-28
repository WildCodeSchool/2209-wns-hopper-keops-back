import { IsEmail } from "class-validator";
import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
@ObjectType()
export class Token {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  token: string;

  @Column()
  @Field()
  createdAt: Date;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}

// Class de d'écriture TypeGraphQL,
// plus besoin de TypeORM et des champs nécéssaire à la lecture
// Ajout de la validation des champs avec class-validator

@InputType()
export class TokenInput {
  token: string;
  createdAt: Date;
  user: User;

  @Field()
  @IsEmail()
  email: string;
}
