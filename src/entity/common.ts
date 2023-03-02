import { Field, ID, InputType } from "type-graphql";

@InputType()
export class UniqueRelation {
  @Field(() => ID)
  id: string;
}

@InputType()
export class SuccessRelation {
  @Field(() => Date)
  date: Date;

  @Field(() => UniqueRelation)
  action: UniqueRelation;
}