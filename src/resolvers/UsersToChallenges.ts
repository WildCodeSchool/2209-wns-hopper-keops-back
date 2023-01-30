import dataSource from "../utils";
import { Arg, Ctx, ID, Mutation, Resolver } from "type-graphql";
import {
  UpdateUserToChallengeInput,
  UserToChallenge,
} from "../entity/UserToChallenge";
import { IContext } from "../auth";

const repository = dataSource.getRepository(UserToChallenge);

@Resolver()
export class UserToChallengesResolver {
  @Mutation(() => UserToChallenge)
  async createUserToChallenge(
    @Arg("challengeId", () => ID) challengeId: string,
    @Arg("userId") userId: string
  ): Promise<UserToChallenge | null> {
    const data: UpdateUserToChallengeInput = {
      user: { id: userId },
      challenge: { id: challengeId },
    };
    const userToChallenge = await repository.save({
      ...data,
      isAccepted: false,
    });
    return userToChallenge;
  }

  @Mutation(() => UserToChallenge)
  async updateUserToChallenge(
    @Arg("challengeId", () => ID) challengeId: string,
    @Arg("isAccepted") isAccepted: boolean,
    @Ctx() context: IContext
  ): Promise<UserToChallenge | null> {
    const data: UpdateUserToChallengeInput = {
      isAccepted,
      user: context.me,
      challenge: { id: challengeId },
    };

    console.log("ME:", context.me);

    try {
      return await repository.save({ ...data, isAccepted });
    } catch {
      throw new Error("Une erreur s'est produite.");
    }
  }

  // @Mutation(() => UserToChallenge)
  // async deleteUserToChallenge(
  //   @Arg("challengeId", () => ID) challengeId: string,
  //   @Arg("isAccepted") isAccepted: boolean,
  //   @Arg("userId", () => ID) userId: string
  // ): Promise<UserToChallenge | null> {
  //   const data: UpdateUserToChallengeInput = {
  //     isAccepted: false,
  //     user: { ...user, id: userId },
  //     challenge: { id: challengeId },
  //   };

  //   const userToChallenge = await repository.remove({ where: { ...data } });

  //   return userToChallenge;
  // }
}
