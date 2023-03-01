import dataSource from "../utils";
import {
  Arg,
  Authorized,
  Ctx,
  Mutation,
  Query,
  Resolver,
  ID,
} from "type-graphql";
import {
  Success,
  DeleteSuccessInput,
  CreateSuccessInput,
} from "../entity/Success";
import { IContext } from "../auth";

// Import de l'entity UTC ✓
// Création d'un Success
// Création d'une liaison
const repository = dataSource.getRepository(Success);

@Resolver()
export class SuccesssResolver {
  @Authorized()
  @Mutation(() => Success)
  async createSuccess(
    @Arg("data", () => CreateSuccessInput) data: CreateSuccessInput,
    @Ctx() context: IContext
  ): Promise<Success | null> {
    try {
      const success = await repository.save({
        action: data.action,
        challenge: data.challenge,
        user: context.me,
        createdAt: new Date(),
      });
      return success;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  @Authorized()
  @Mutation(() => Success)
  async deleteSuccess(
    @Arg("data", () => DeleteSuccessInput) data: DeleteSuccessInput,
    @Ctx() context: IContext
  ): Promise<Success | null> {
    try {
      const success = await repository.findOne({
        where: { id: data.id, user: context.me },
      });
      if (success !== null) {
        return await repository.remove(success);
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // @Authorized()
  // @Query(() => Success)
  // async readOneSuccess(
  //   @Arg("successID", () => ID) successID: string
  // ): Promise<Success | null> {
  //   return await repository.findOneBy({ id: successID });
  // }

  // @Authorized()
  // @Query(() => [Success])
  // async readAllSuccesses(): Promise<Success[] | null> {
  //   return await repository.find({ relations: ["actions"] });
  // }
}
