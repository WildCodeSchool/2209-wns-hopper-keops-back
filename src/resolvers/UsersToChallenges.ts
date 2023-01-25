import dataSource from "../utils";
import { Arg, Mutation, Resolver } from "type-graphql";
import { Challenge, ChallengeInput } from "../entity/Challenge";

const repository = dataSource.getRepository(Challenge);

@Resolver()
export class UserToChallengesResolver {
  @Mutation(() => Challenge)
  async createChallenge(
    @Arg("data", () => ChallengeInput) data: ChallengeInput
  ): Promise<Challenge> {
    data.start_date = new Date();
    const challenge = await repository.save(data);
    return challenge;
  }
}
