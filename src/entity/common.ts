import { Field, ID } from "type-graphql";

export class UniqueRelation {
  @Field(() => ID)
  id: string;
}

export class ManyRelations {
  @Field(() => [ID])
  connects: string[];

  // pourquoi on a un disconect ?
  @Field(() => [ID])
  disconnects: string[];
}
