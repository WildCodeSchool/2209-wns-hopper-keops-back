import dataSource from "../utils";
import { Arg, Authorized, ID, Mutation, Resolver } from "type-graphql";
import { ActionToChallengeInput, Challenge } from "../entity/Challenge";

const challengeRepository = dataSource.getRepository(Challenge);

@Resolver()
export class ActionsToChallengesResolver {
  @Authorized()
  @Mutation(() => Challenge)
  // A optimiser !!
  async setActionToChallenge(
    @Arg("challengeId", () => ID) challengeId: string,
    @Arg("data", () => ActionToChallengeInput) data: ActionToChallengeInput
  ): Promise<Challenge | null> {
    try {
      const challenge = await challengeRepository.findOne({
        where: { id: challengeId },
        relations: { actions: true },
      });

      if (challenge === null) {
        return null;
      }

      challenge.actions = data.actions;

      console.log(challenge);

      return await challengeRepository.save(challenge);
    } catch {
      return null;
    }
  }
}
