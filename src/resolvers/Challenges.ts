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
import { formatDate } from "../helper";

// Import de l'entity UTC ✓
// Création d'un challenge
// Création d'une liaison
const repository = dataSource.getRepository(Challenge);
const UserToChallengeRepository = dataSource.getRepository(UserToChallenge);

@Resolver()
export class ChallengesResolver {
  @Authorized()
  @Mutation(() => Challenge, { nullable: true })
  async createChallenge(
    @Arg("data", () => CreateChallengeInput) data: CreateChallengeInput,
    @Ctx() context: IContext
  ): Promise<Challenge | null> {
    try {
      if (formatDate(data.start_date) < formatDate(new Date())) {
        throw new Error("Date invalide !");
      }
      let isInProgress = false;

      if (formatDate(data.start_date) === formatDate(new Date())) {
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
  @Mutation(() => Challenge, { nullable: true })
  async updateChallenge(
    @Arg("data", () => UpdateChallengeInput) data: UpdateChallengeInput,
    @Arg("challengeId", () => ID) challengeId: string,
    @Ctx() context: IContext
  ): Promise<Challenge | null> {
    try {
      if (formatDate(data.start_date) < formatDate(new Date())) {
        throw new Error("Date invalide !");
      }
      let isInProgress = false;

      if (formatDate(data.start_date) === formatDate(new Date())) {
        isInProgress = true;
      }

      const challenge = await repository.findOneOrFail({
        where: { id: challengeId, createdBy: { id: context.me.id } },
      });

      if (challenge.status === "Non commencé") {
        data.updatedAt = new Date();
        data.updatedBy = context.me;
        data.is_in_progress = isInProgress;
        return await repository.save({ ...challenge, ...data });
      } else throw new Error(`Challenge ${challenge.status}`);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  @Authorized()
  @Query(() => Challenge, { nullable: true })
  async readOneChallenge(
    @Arg("challengeID", () => ID) challengeID: string
  ): Promise<Challenge | null> {
    try {
      return await repository.findOneOrFail({
        where: { id: challengeID },
        relations: [
          "actions",
          "createdBy",
          "userToChallenges",
          "userToChallenges.user",
        ],
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  @Authorized()
  @Query(() => [Challenge], { nullable: true })
  async readAllChallenges(): Promise<Challenge[] | null> {
    try {
      return await repository.find({
        relations: [
          "actions",
          "createdBy",
          "userToChallenges",
          "userToChallenges.user",
        ],
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  @Authorized()
  @Query(() => [Challenge], { nullable: true })
  async readMyChallenges(
    @Ctx() context: IContext
  ): Promise<Challenge[] | null> {
    try {
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
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  @Authorized()
  @Mutation(() => Challenge, { nullable: true })
  async deleteMyChallenge(
    @Arg("challengeId", () => ID) challengeId: string,
    @Ctx() context: IContext
  ): Promise<Challenge | null> {
    try {
      const challenge = await repository.findOneOrFail({
        where: { id: challengeId, createdBy: { id: context.me.id } },
      });

      return await repository.remove(challenge);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
