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
      const challenge = await repository.save({
        length: data.length,
        start_date: data.start_date,
        name: data.name,
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
    } catch {
      return null;
    }
  }

  @Authorized()
  @Mutation(() => Challenge)
  async updateChallenge(
    @Arg("data", () => UpdateChallengeInput) data: UpdateChallengeInput,
    @Ctx() context: IContext
  ): Promise<Challenge> {
    data.updatedAt = new Date();
    data.updatedBy = context.me;
    const challenge = await repository.save(data);
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
