import { IsEmail, Length } from "class-validator";
import { Field, ID, InputType, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

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

  @Column({ nullable: true })
  @Field({ nullable: true })
  updatedBy: string;

  @Column({ default: false })
  @Field()
  isAdmin: boolean;
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
  @IsEmail()
  email: string;

  @Field()
  @Length(2, 60)
  name: string;
}
