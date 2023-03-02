import dataSource from "../utils";
import { Arg, Authorized, Ctx, Mutation, Resolver } from "type-graphql";
import {
  Success,
  DeleteSuccessInput,
  CreateSuccessInput,
  CreateSuccessesInput,
} from "../entity/Success";
import { IContext } from "../auth";
import { UserToChallenge } from "../entity/UserToChallenge";
import { Action } from "../entity/Action";

// Import de l'entity UTC ✓
// Création d'un Success
// Création d'une liaison
const repository = dataSource.getRepository(Success);
const UserToChallengeRepository = dataSource.getRepository(UserToChallenge);
const ActionRepository = dataSource.getRepository(Action);

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

      const userToChallenge = await UserToChallengeRepository.findOne({
        where: { challenge: data.challenge, user: context.me },
      });

      const action = await ActionRepository.findOneBy({ id: data.action.id });

      if (userToChallenge !== null && action !== null) {
        await UserToChallengeRepository.save({
          ...userToChallenge,
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          challengeScore: userToChallenge.challengeScore + action.successValue,
        });
      }

      return success;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  @Authorized()
  @Mutation(() => Boolean)

  async createSuccesses(
    @Arg("data", () => CreateSuccessesInput) data: CreateSuccessesInput,
    @Ctx() context: IContext
  ): Promise<boolean> {
    try {
      const user = context.me;
      const challenge = data.challenge;

      for (const successRelation of data.successesRelation){
        const success = await repository.save({
          user, challenge, date: successRelation.date, action: successRelation.action
        })
        if(success !== null){
          const action = await ActionRepository.findOneBy({ id: successRelation.action.id });
          const userToChallenge = await UserToChallengeRepository.findOne({
            where: { challenge, user },
          });

          if(userToChallenge !== null && action !== null){
            await UserToChallengeRepository.save({
              ...userToChallenge,
              // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
              challengeScore: userToChallenge.challengeScore + action.successValue,
            });
          }
        }
      };
      return true;
    } catch (err) {
      console.error(err);
      return false;
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
        relations: ["challenge", "action"],
      });
      if (success !== null) {
        console.log("SUCESSSSSSSS", success);

        const userToChallenge = await UserToChallengeRepository.findOne({
          where: { challenge: success.challenge, user: context.me },
        });

        const action = await ActionRepository.findOneBy({
          id: success.action.id,
        });

        const successToRemove = await repository.remove(success);

        if (userToChallenge !== null && action !== null) {
          await UserToChallengeRepository.save({
            ...userToChallenge,
            challengeScore:
              userToChallenge.challengeScore - action.successValue,
          });
        }

        return successToRemove;
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
