import dataSource from "../utils";
import { Arg, Authorized, ID, Mutation, Resolver } from "type-graphql";
import { ActionToChallengeInput, Challenge } from "../entity/Challenge";
import { Action } from "../entity/Action";

const challengeRepository = dataSource.getRepository(Challenge);
const actionRepository = dataSource.getRepository(Action);

@Resolver()
export class ActionsToChallengesResolver {
  @Authorized()
  @Mutation(() => Challenge)
  async createActionToChallenge(
    @Arg("challengeId", () => ID) challengeId: string,
    @Arg("actionsId", () => [ID]) actionsId: string[]
  ): Promise<Challenge | null> {
    const data: ActionToChallengeInput = {
      actions: {
        connects: [...actionsId],
      },
    };

    const challenge = await challengeRepository.findOne({
      where: { id: challengeId },
      relations: { actions: true },
    });

    if (challenge === null) {
      return null;
    }

    for (const actionId of data.actions.connects) {
      const action = await actionRepository.findOne({
        where: { id: actionId },
      });
      if (action !== null) {
        if (!challenge.actions.some((action) => action.id === actionId)) {
          challenge.actions.push(action);
        }
      }
    }

    return await challengeRepository.save(challenge);
  }
}
