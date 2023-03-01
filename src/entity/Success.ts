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
import { UserToSuccess } from "./UserToSuccess";

// Création et gestion du schema de donnée de wilder TypeORM
// Class de lecture TypeGraphQL

@Entity()
@ObjectType()
export class Success {
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

  // A modifier pour renvoyer la date de fin du Success
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
  @Field(() => Date)
  updatedAt: Date;

  @ManyToMany(() => Action, (action) => action.Successs, {
    onUpdate: "CASCADE",
  })
  @Field(() => [Action])
  @JoinTable()
  actions: Action[];

  // User
  @ManyToOne(() => User)
  @Field(() => User)
  updatedBy: User;

  @OneToMany(() => UserToSuccess, (userToSuccess) => userToSuccess.Success)
  @Field(() => [UserToSuccess])
  userToSuccesss: UserToSuccess[];
}

// Class de d'écriture TypeGraphQL,
// plus besoin de TypeORM et des champs nécéssaire à la lecture
// Ajout de la validation des champs avec class-validator

@InputType()
export class ActionToSuccessInput {
  @Field(() => [UniqueRelation])
  actions: UniqueRelation[];
}

@InputType()
export class UpdateSuccessInput {
  @Field()
  length: number;

  @Field(() => Date)
  start_date: Date;

  @Field()
  name: string;

  updatedAt: Date;
  updatedBy: User;
}

@InputType()
export class CreateSuccessInput {
  @Field()
  length: number;

  @Field(() => Date)
  start_date: Date;

  @Field()
  name: string;

  @Field(() => [UniqueRelation])
  actions: UniqueRelation[];

  createdAt: Date;
  createdBy: User;
}
