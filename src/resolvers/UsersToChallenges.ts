import dataSource from "../utils";
import { Arg, Authorized, Ctx, ID, Mutation, Resolver } from "type-graphql";
import {
  UserToChallenge,
  UserToChallengeInput,
} from "../entity/UserToChallenge";
import { IContext } from "../auth";

const repository = dataSource.getRepository(UserToChallenge);

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
      // const userToChallengeSaved = await repository.update(
      //   { user: data.user, challenge: data.challenge },
      //   { isAccepted: data.isAccepted }
      // );
      // return null;

      const userToChallenge = await repository.findOne({
        where: { user: data.user, challenge: data.challenge },
      });
      return await repository.save({
        ...userToChallenge,
        isAccepted: data.isAccepted,
      });
    } catch {
      throw new Error("Une erreur s'est produite.");
    }
  }

  // @Authorized()
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
