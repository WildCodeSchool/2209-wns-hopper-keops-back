import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
  BaseEntity,
} from "typeorm";
import { Action } from "./Action";
import { UniqueRelation } from "./common";
import { User } from "./User";
import { UserToChallenge } from "./UserToChallenge";
import { formatDate } from "../helper";

// Création et gestion du schema de donnée de wilder TypeORM
// Class de lecture TypeGraphQL

@Entity()
@ObjectType()
export class Challenge extends BaseEntity {
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

  // A modifier pour renvoyer la date de fin du challenge
  @Field()
  get end_date(): Date {
    return new Date(
      this.start_date.getTime() + this.length * 24 * 60 * 60 * 1000
    );
  }

  @Column({ default: false })
  @Field()
  is_in_progress: boolean;

  @Field()
  get status(): string {
    // challenge started , so I cannot update a between action and challenge
    if (this.is_in_progress) {
      return "En cours";
    } else if (
      // challenge is over, so I cannot update relation between action and challenge
      !this.is_in_progress &&
      formatDate(this.end_date) < formatDate(new Date())
    ) {
      return "Terminé";
    }
    // challenge is not started yet, so I can update challenge
    else {
      return "Non commencé";
    }
  }

  @Column()
  @Field()
  createdAt: Date;

  // User
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @Field(() => User)
  createdBy: User;

  @Column({ default: null })
  @Field(() => Date)
  updatedAt: Date;

  @ManyToMany(() => Action, (action) => action.challenges, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  @Field(() => [Action])
  @JoinTable()
  actions: Action[];

  // User
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @Field(() => User)
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
export class ActionToChallengeInput {
  @Field(() => [UniqueRelation])
  actions: UniqueRelation[];
}

@InputType()
export class UpdateChallengeInput {
  @Field()
  length: number;

  @Field(() => Date)
  start_date: Date;

  @Field()
  name: string;

  is_in_progress: boolean;
  updatedAt: Date;
  updatedBy: User;
}

@InputType()
export class CreateChallengeInput {
  @Field()
  length: number;

  @Field(() => Date)
  start_date: Date;

  @Field()
  name: string;

  @Field(() => [UniqueRelation])
  actions: UniqueRelation[];

  is_in_progress: boolean;
  createdAt: Date;
  createdBy: User;
}
