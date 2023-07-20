import dataSource from "../utils";
import { Arg, Authorized, Ctx, ID, Mutation, Resolver } from "type-graphql";
import { ActionToChallengeInput, Challenge } from "../entity/Challenge";
import { Action } from "../entity/Action";
import { UniqueRelation } from "../entity/common";
import { In } from "typeorm";
import { IContext } from "../auth";

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
  @Mutation(() => Challenge, { nullable: true })
  // A optimiser !!
  async updateActionToChallenge(
    @Arg("challengeId", () => ID) challengeId: string,
    @Arg("data", () => ActionToChallengeInput) data: ActionToChallengeInput,
    @Ctx() context: IContext
  ): Promise<Challenge | null> {
    try {
      const challenge = await challengeRepository.findOneOrFail({
        where: { id: challengeId, createdBy: { id: context.me.id } },
      });
      if (challenge.status === "Non commencé") {
        return await setActionToChallengeFct(data.actions, challengeId);
      } else throw new Error(`Challenge ${challenge.status}`);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
