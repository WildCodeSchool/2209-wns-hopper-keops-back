import dataSource from "../utils";
import { Arg, Authorized, Ctx, Mutation, Resolver } from "type-graphql";
import { Action, ActionInput } from "../entity/Action";
import { IContext } from "../auth";

// Import de l'entity UTC ✓
// Création d'un challenge
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
    const Action = await repository.save({ ...data, createdBy: context.me });
    return Action;
  }
}
