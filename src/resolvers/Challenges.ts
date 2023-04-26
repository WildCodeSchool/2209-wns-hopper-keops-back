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
import {
  Challenge,
  CreateChallengeInput,
  UpdateChallengeInput,
} from "../entity/Challenge";
import { IContext } from "../auth";
import { setActionToChallengeFct } from "./ActionsToChallenge";
import { UserToChallenge } from "../entity/UserToChallenge";

// Import de l'entity UTC ✓
// Création d'un challenge
// Création d'une liaison
const repository = dataSource.getRepository(Challenge);
const UserToChallengeRepository = dataSource.getRepository(UserToChallenge);

@Resolver()
export class ChallengesResolver {
  @Authorized()
  @Mutation(() => Challenge)
  async createChallenge(
    @Arg("data", () => CreateChallengeInput) data: CreateChallengeInput,
    @Ctx() context: IContext
  ): Promise<Challenge | null> {
    try {
      let isInProgress = false;

      if (data.start_date < new Date()) {
        throw new Error("Date invalide !");
      }

      if (data.start_date.getDate() === new Date().getDate()) {
        isInProgress = true;
      }

      const challenge = await repository.save({
        length: data.length,
        start_date: data.start_date,
        name: data.name,
        is_in_progress: isInProgress,
        createdBy: context.me,
        createdAt: new Date(),
      });

      // ! UserToChallengeRepository to put in a function in UserToChallenge Resolver
      await UserToChallengeRepository.save({
        user: context.me,
        challenge,
        isAccepted: true,
      });

      return await setActionToChallengeFct(data.actions, challenge.id);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  @Authorized()
  @Mutation(() => Challenge)
  async updateChallenge(
    @Arg("data", () => UpdateChallengeInput) data: UpdateChallengeInput,
    @Arg("challengeId", () => ID) challengeId: string,
    @Ctx() context: IContext
  ): Promise<Challenge | null> {
    try {
      if (data.start_date < new Date()) {
        throw new Error("Date invalide !");
      }

      const challenge = await repository.findOneOrFail({
        where: { id: challengeId, createdBy: { id: context.me.id } },
      });

      data.updatedAt = new Date();
      data.updatedBy = context.me;

      return await repository.save({ ...challenge, ...data });
    } catch (error) {
      console.log(error);
      return null;
    }
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
    return await repository.find({
      relations: [
        "actions",
        "createdBy",
        "userToChallenges",
        "userToChallenges.user",
      ],
    });
  }

  @Authorized()
  @Query(() => [Challenge])
  async readMyChallenges(
    @Ctx() context: IContext
  ): Promise<Challenge[] | null> {
    return await repository.find({
      where: {
        userToChallenges: {
          user: { id: context.me.id },
        },
      },
      relations: [
        "actions",
        "createdBy",
        "userToChallenges",
        "userToChallenges.user",
      ],
    });
  }
}
