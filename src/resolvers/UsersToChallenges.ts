import dataSource from "../utils";
import { Arg, Authorized, Ctx, ID, Mutation, Resolver } from "type-graphql";
import {
  RemoveUserToChallengeInput,
  UserToChallenge,
  UserToChallengeInput,
} from "../entity/UserToChallenge";
import { IContext } from "../auth";

const repository = dataSource.getRepository(UserToChallenge);

// interface IRequestSuccess {
//   success: boolean;
//   error?: Error;
// }

@Resolver()
export class UserToChallengesResolver {
  @Authorized()
  @Mutation(() => UserToChallenge)
  async createUserToChallenge(
    @Arg("challengeId", () => ID) challengeId: string,
    @Arg("isAccepted") isAccepted: boolean,
    @Ctx() context: IContext
  ): Promise<UserToChallenge | null> {
    const data: UserToChallengeInput = {
      isAccepted,
      user: context.me,
      challenge: { id: challengeId },
    };

    return await repository.save(data);
  }

  @Authorized()
  @Mutation(() => UserToChallenge)
  async updateUserToChallenge(
    @Arg("challengeId", () => ID) challengeId: string,
    @Arg("isAccepted") isAccepted: boolean,
    @Ctx() context: IContext
  ): Promise<Partial<UserToChallenge> | null> {
    const data: UserToChallengeInput = {
      isAccepted,
      user: context.me,
      challenge: { id: challengeId },
    };

    try {
      // ! how to update without get request before save ?
      // const userToChallengeSaved = await repository.update(
      //   { user: data.user, challenge: data.challenge },
      //   { isAccepted: data.isAccepted }
      // );
      // return null;

      const userToChallenge = await repository.findOne({
        where: { user: { id: data.user.id }, challenge: data.challenge },
      });
      return await repository.save({
        ...userToChallenge,
        isAccepted: data.isAccepted,
      });
    } catch {
      throw new Error("Une erreur s'est produite.");
    }
  }

  @Authorized()
  @Mutation(() => UserToChallenge)
  async deleteUserToChallenge(
    @Arg("data", () => RemoveUserToChallengeInput)
    data: RemoveUserToChallengeInput,
    @Ctx() context: IContext
  ): Promise<UserToChallenge | null> {
    const userToChallengeToRemove = await repository.findOne({
      where: { id: data.userToChallengeId },
      relations: ["challenge.createdBy"],
    });

    if (userToChallengeToRemove?.challenge?.createdBy.id === context.me.id) {
      return await repository.remove(userToChallengeToRemove);
    }

    return null;
  }
}
