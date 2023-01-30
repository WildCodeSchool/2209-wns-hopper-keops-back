import dataSource from "../utils";
import {
  Arg,
  Authorized,
  Ctx,
  Mutation,
  Query,
  Resolver,
  ID,
} from "type-graphql";
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
    const challenge = await repository.save({
      ...data,
      createdBy: context.me,
      createdAt: new Date(),
    });
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

  @Authorized()
  @Query(() => Challenge)
  async readOneChallenge(
    @Arg("challengeID", () => ID) challengeID: string
  ): Promise<Challenge | null> {
    return await repository.findOneBy({ id: challengeID });
  }

  @Authorized()
  @Query(() => [Challenge])
  async readAllChallenges(): Promise<Challenge[] | null> {
    return await repository.find({ relations: ["actions"] });
  }
}
