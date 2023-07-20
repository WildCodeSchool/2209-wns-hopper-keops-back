import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
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
  successValue: number;

  @Column()
  @Field()
  createdAt: Date;

  // User
  @ManyToOne(() => User)
  @Field(() => User)
  createdBy: User;

  @Column({ default: null })
  @Field(() => Date)
  updatedAt: Date;

  // User
  @ManyToOne(() => User)
  @Field(() => User)
  updatedBy: User;

  @ManyToMany(() => Challenge, (challenge) => challenge.actions, {
    onDelete: "CASCADE",
  })
  @Field(() => [Challenge])
  challenges: Challenge[];
}

// Class de d'écriture TypeGraphQL,
// plus besoin de TypeORM et des champs nécéssaire à la lecture
// Ajout de la validation des champs avec class-validator

@InputType()
export class ActionInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  successValue: number;

  createdBy: User;
  createdAt: Date;
}
