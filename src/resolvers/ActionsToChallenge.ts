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
    @Arg("isAccepted") isAccepted: boolean,
    @Ctx() context: IContext
  ): Promise<UserToChallenge | null> {
    const data: UpdateUserToChallengeInput = {
      isAccepted,
      user: context.me,
      challenge: { id: challengeId },
    };
    const userToChallenge = await repository.save(data);
    return userToChallenge;
  }
}
