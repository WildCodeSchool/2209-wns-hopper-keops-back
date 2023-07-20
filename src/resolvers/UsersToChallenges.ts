import dataSource from "../utils";
import { Arg, Authorized, Ctx, ID, Mutation, Query, Resolver } from "type-graphql";
import {
  RemoveUserToChallengeInput,
  UserToChallenge,
  UserToChallengeInput,
} from "../entity/UserToChallenge";
import { IContext } from "../auth";
import { User } from "../entity/User";

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
  @Mutation(() => UserToChallenge, { nullable: true })
  async deleteUserToChallenge(
    @Arg("data", () => RemoveUserToChallengeInput)
    data: RemoveUserToChallengeInput,
    @Ctx() context: IContext
  ): Promise<UserToChallenge | null> {
    try {
      // Find the user challenge connection with challenge admin and user relation
      const userToChallengeToRemove = await repository.findOneOrFail({
        where: { id: data.userToChallengeId },
        relations: ["challenge.createdBy", "user"],
      });

      // The current user is the challenge admin or the owner of the user challenge connection
      if (
        userToChallengeToRemove.challenge.createdBy.id === context.me.id ||
        userToChallengeToRemove.user.id === context.me.id
      ) {
        return await repository.remove(userToChallengeToRemove);
      } else {
        throw new Error("Your not able to do that");
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  @Authorized()
  @Query(() => [UserToChallenge])
  async readChallengeLeaderboard(
    @Arg("challengeId") challengeId: string
  ): Promise<UserToChallenge[]> {
    try {
      const userToChallenges = await repository.find({
        where: { challenge: { id: challengeId } },
        relations: ["user"],
      });

      userToChallenges.forEach((userToChallenge) => {
        if (!userToChallenge.user) {
          userToChallenge.user = new User();
        }
      });

      userToChallenges.sort((a, b) => b.challengeScore - a.challengeScore);

      return userToChallenges;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

