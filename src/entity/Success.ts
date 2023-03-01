import { Field, ID, InputType, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Action } from "./Action";
import { Challenge } from "./Challenge";
import { UniqueRelation } from "./common";
import { User } from "./User";

// Création et gestion du schema de donnée de wilder TypeORM
// Class de lecture TypeGraphQL

@Entity()
@ObjectType()
export class Success {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => Date)
  createdAt: Date;

  // User
  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @ManyToOne(() => Action)
  @Field(() => Action)
  action: Action;

  @ManyToOne(() => Challenge)
  @Field(() => Challenge)
  challenge: Challenge;
}

// Class de d'écriture TypeGraphQL,
// plus besoin de TypeORM et des champs nécéssaire à la lecture
// Ajout de la validation des champs avec class-validator

@InputType()
export class CreateSuccessInput {
  @Field(() => UniqueRelation)
  action: UniqueRelation;

  @Field(() => UniqueRelation)
  challenge: UniqueRelation;

  createdAt: Date;
  user: User;
}
