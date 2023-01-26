import dataSource from "../utils";
import { Arg, Authorized, Ctx, Mutation, Resolver } from "type-graphql";
import { Challenge, ChallengeInput } from "../entity/Challenge";
import { IContext } from "../auth";

// Import de l'entity UTC ✓
// Création d'un challenge
// Création d'une liaison
const repository = dataSource.getRepository(Challenge);

@Resolver()
export class ChallengesResolver {
  @Authorized()
  @Mutation(() => Challenge)
  async createChallenge(
    @Arg("data", () => ChallengeInput) data: ChallengeInput,
    @Ctx() context: IContext
  ): Promise<Challenge> {
    const challenge = await repository.save({ ...data, createdBy: context.me });
    return challenge;
  }

  @Authorized()
  @Mutation(() => Challenge)
  async updateChallenge(
    @Arg("data", () => ChallengeInput) data: ChallengeInput,
    @Ctx() context: IContext
  ): Promise<Challenge> {
    const challenge = await repository.save({ ...data, createdBy: context.me });
    return challenge;
  }
}
