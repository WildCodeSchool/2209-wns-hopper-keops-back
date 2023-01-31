import dataSource from "../utils";
import { Arg, Authorized, ID, Mutation, Resolver } from "type-graphql";
import { ActionToChallengeInput, Challenge } from "../entity/Challenge";
import { Action } from "../entity/Action";

const challengeRepository = dataSource.getRepository(Challenge);
const actionRepository = dataSource.getRepository(Action);

export const setActionToChallengeFct = async (
  data: ActionToChallengeInput,
  challengeId: string
): Promise<Challenge | null> => {
  try {
    const challenge = await challengeRepository.findOne({
      where: { id: challengeId },
    });

    if (challenge === null) {
      return null;
    }

    challenge.actions = [];

    for (const actionId of data.actions) {
      const action = await actionRepository.findOne({
        where: { id: actionId.id },
      });

      if (action !== null) {
        challenge.actions.push(action);
      }
    }
    return await challengeRepository.save(challenge);
  } catch {
    return null;
  }
};

@Resolver()
export class ActionsToChallengesResolver {
  @Authorized()
  @Mutation(() => Challenge)
  // A optimiser !!
  async setActionToChallenge(
    @Arg("challengeId", () => ID) challengeId: string,
    @Arg("data", () => ActionToChallengeInput) data: ActionToChallengeInput
  ): Promise<Challenge | null> {
    return await setActionToChallengeFct(data, challengeId);
  }
}
