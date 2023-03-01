import dataSource from "../utils";
import { Arg, Authorized, Ctx, Mutation, Resolver } from "type-graphql";
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
export class SuccessResolver {
  @Authorized()
  @Mutation(() => Success)

  // ! Verify date is between challenge.start_date and challenge.end_date
  async createSuccess(
    @Arg("data", () => CreateSuccessInput) data: CreateSuccessInput,
    @Ctx() context: IContext
  ): Promise<Success | null> {
    try {
      const success = await repository.save({
        action: data.action,
        challenge: data.challenge,
        user: context.me,
        date: data.date,
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
