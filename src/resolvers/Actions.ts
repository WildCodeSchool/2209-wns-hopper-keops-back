import dataSource from "../utils";
import {
  Arg,
  Authorized,
  Ctx,
  Mutation,
  Resolver,
  Query,
  ID,
} from "type-graphql";
import { Action, ActionInput } from "../entity/Action";
import { IContext } from "../auth";

// Import de l'entity UTC ✓
// Création d'un Action
// Création d'une liaison
const repository = dataSource.getRepository(Action);

@Resolver()
export class ActionsResolver {
  @Authorized()
  @Mutation(() => Action)
  async createAction(
    @Arg("data", () => ActionInput) data: ActionInput,
    @Ctx() context: IContext
  ): Promise<Action> {
    console.log("DATAAAAAAAAAA", data);

    data.createdBy = context.me;
    data.createdAt = new Date();
    const Action = await repository.save(data);
    return Action;
  }

  @Authorized()
  @Query(() => Action)
  async readOneAction(
    @Arg("actionID", () => ID) actionID: string
  ): Promise<Action | null> {
    return await repository.findOneBy({ id: actionID });
  }

  @Authorized()
  @Query(() => [Action], { nullable: true })
  async readAllActions(): Promise<Action[] | null> {
    try {
      return await repository.find();
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
