import dataSource from "../utils";
import { Arg, ID, Mutation, Resolver } from "type-graphql";
import { UserToChallenge } from "../entity/UserToChallenge";
import { User } from "../entity/User";
import { Challenge } from "../entity/Challenge";

const repository = dataSource.getRepository(UserToChallenge);

interface IUserToChallenge {
  user: User;
  challenge: Challenge;
}

@Resolver()
export class UserToChallengesResolver {
  @Mutation(() => UserToChallenge)
  async createUserToChallenge(
    @Arg("userId", () => ID) userId: string,
    @Arg("challengeId", () => ID) challengeId: string
  ): Promise<UserToChallenge | null> {
    const user = await dataSource
      .getRepository(User)
      .findOne({ where: { id: userId } });
    const challenge = await dataSource
      .getRepository(Challenge)
      .findOne({ where: { id: challengeId } });

    if (user && challenge) {
      const data: IUserToChallenge = { user, challenge };
      const userToChallenge = await repository.save(data);
      return userToChallenge;
    }

    return null;
  }
}
