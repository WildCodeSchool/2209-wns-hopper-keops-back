import dataSource from "../utils";
import { Arg, Authorized, Ctx, Mutation, Resolver } from "type-graphql";
import {
  Success,
  DeleteSuccessInput,
  CreateSuccessInput,
  CreateSuccessesInput,
  DeleteSuccessesInput,
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

interface IActionSuccess {
  id: string;
  successValue: number;
}

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
      let addScore = 0;
      const actionsIds: string[] = [];
      const actionsWithSuccess: IActionSuccess[] = [];

      // Push each action.id includes in data.successRaltaion in actionsIds one time : string[]
      for (const successRelation of data.successesRelation) {
        if (!actionsIds.includes(successRelation.action.id)) {
          actionsIds.push(successRelation.action.id);
        }
      }

      // Find in DB each actions
      // Push partialAction in actionsWithSuccess : IActionSuccess[]
      for (const id of actionsIds) {
        const selectedAction = await dataSource
          .getRepository(Action)
          .findOneBy({ id });
        if (selectedAction !== null) {
          actionsWithSuccess.push({
            id,
            successValue: selectedAction.successValue,
          });
        }
      }

      for (const successRelation of data.successesRelation) {
        // Create success in DB
        const success = await repository.save({
          user,
          challenge,
          date: successRelation.date,
          action: successRelation.action,
        });

        // Find the partial action equal to successRelation.action.id
        const partialAction = actionsWithSuccess.find(
          (action) => action.id === successRelation.action.id
        );

        // add the action value to  addScore
        if (success !== null && partialAction !== undefined) {
          addScore = addScore + Number(partialAction.successValue);
        }
      }

      // Get the relation betwen the user and the challenge
      const userToChallenge = await UserToChallengeRepository.findOne({
        where: { challenge, user },
      });

      // Update the score of the userToChallenge
      if (userToChallenge !== null) {
        await UserToChallengeRepository.save({
          ...userToChallenge,
          challengeScore: Number(userToChallenge.challengeScore) + addScore,
        });
      }

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

  @Authorized()
  @Mutation(() => Boolean)
  async deleteSuccesses(
    @Arg("data", () => DeleteSuccessesInput) data: DeleteSuccessesInput,
    @Ctx() context: IContext
  ): Promise<boolean> {
    try {
      if (data.successIds.length !== 0) {
        console.log("Data SuccesIds array is not empty !!!!!!");
        const user = context.me;
        const challenge = data.challenge;
        let removeScore = 0;

        for (const successId of data.successIds) {
          console.log("SuccesIds is rollin !!!!!!!");
          const successToRemove = await dataSource
            .getRepository(Success)
            .findOne({
              where: { id: successId },
              relations: ["action"],
            });

          console.log("Succes to remove", successToRemove);

          // Remove success
          if (successToRemove !== null) {
            const succesValue = successToRemove.action.successValue;
            await dataSource.getRepository(Success).remove(successToRemove);
            removeScore += succesValue;
          }
        }

        // Get the relation betwen the user and the challenge
        const userToChallenge = await UserToChallengeRepository.findOne({
          where: { challenge, user },
        });

        // Update the score of the userToChallenge
        if (userToChallenge !== null) {
          await UserToChallengeRepository.save({
            ...userToChallenge,
            challengeScore:
              Number(userToChallenge.challengeScore) - removeScore,
          });
        }
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
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
