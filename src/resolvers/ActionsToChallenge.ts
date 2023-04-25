import dataSource from "../utils";
import { Arg, Authorized, ID, Mutation, Resolver } from "type-graphql";
import { ActionToChallengeInput, Challenge } from "../entity/Challenge";
import { Action } from "../entity/Action";
import { UniqueRelation } from "../entity/common";
import { In } from "typeorm";

const challengeRepository = dataSource.getRepository(Challenge);
const actionRepository = dataSource.getRepository(Action);

export const setActionToChallengeFct = async (
  actions: UniqueRelation[],
  challengeId: string
): Promise<Challenge | null> => {
  try {
    const challenge = await challengeRepository.findOne({
      where: { id: challengeId },
    });

    if (challenge === null) {
      return null;
    }
    const actionsToSave = await actionRepository.find({
      where: { id: In(actions.map(({ id }) => id)) },
    });
    return await challengeRepository.save({
      ...challenge,
      actions: actionsToSave,
    });
  } catch {
    return null;
  }
};

@Resolver()
export class ActionsToChallengesResolver {
  @Authorized()
  @Mutation(() => Challenge)
  // A optimiser !!
  async updateActionToChallenge(
    @Arg("challengeId", () => ID) challengeId: string,
    @Arg("data", () => ActionToChallengeInput) data: ActionToChallengeInput
  ): Promise<Challenge | null> {
    return await setActionToChallengeFct(data.actions, challengeId);
  }
}
