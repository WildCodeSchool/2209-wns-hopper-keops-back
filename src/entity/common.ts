import { Field, ID, InputType } from "type-graphql";

@InputType()
export class UniqueRelation {
  @Field(() => ID)
  id: string;
}
