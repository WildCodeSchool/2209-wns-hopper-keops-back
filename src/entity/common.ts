import { Field, ID, InputType } from "type-graphql";

@InputType()
export class UniqueRelation {
  @Field(() => ID)
  id: string;
}

export class ManyRelations {
  @Field(() => [ID])
  connects: string[];

  //   // pourquoi on a un disconect ?
  //   @Field(() => [ID])
  //   disconnects: string[];
}
