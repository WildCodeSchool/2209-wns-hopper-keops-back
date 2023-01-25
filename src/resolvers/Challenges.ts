import dataSource from "../utils";
import { Arg, Mutation, Resolver } from "type-graphql";
import { Challenge, ChallengeInput } from "../entity/Challenge";

// Import de l'entity UTC ✓
// Création d'un challenge
// Création d'une liaison
const repository = dataSource.getRepository(Challenge);

@Resolver()
export class ChallengesResolver {
  @Mutation(() => Challenge)
  async createChallenge(
    @Arg("data", () => ChallengeInput) data: ChallengeInput
  ): Promise<Challenge> {
    data.start_date = new Date();
    const challenge = await repository.save(data);
    return challenge;
  }
}
