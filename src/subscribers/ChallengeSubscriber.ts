import {
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from "typeorm";
import { Challenge } from "../entity/Challenge";
import { User } from "../entity/User";

@EventSubscriber()
export class ChallengeSubscriber
  implements EntitySubscriberInterface<Challenge>
{
  /**
   * Indicates that this subscriber only listen to Challenge events.
   */
  listenTo(): typeof Challenge {
    return Challenge;
  }

  /**
   * Called after Challenge update.
   */
  async afterUpdate(event: UpdateEvent<Challenge>): Promise<void> {
    // Don't do anything when the challenge status was 'Terminé' before update
    if (event.databaseEntity.status !== "Terminé") {
      // Connection to the repositories
      const repositoryChallenge = event.connection.getRepository(Challenge);
      const repositoryUser = event.connection.getRepository(User);

      // Find the challenge in db with all the users
      const challenge = await repositoryChallenge.findOne({
        where: { id: event.entity?.id },
        relations: ["userToChallenges", "userToChallenges.user"],
      });

      // When challenge was found and the status is toggling to 'Terminé' in the last updtate so update global score of each user nether nothing appened
      if (challenge !== null && challenge.status === "Terminé") {
        for (const userToChallenge of challenge.userToChallenges) {
          userToChallenge.user.score += userToChallenge.challengeScore;
          await repositoryUser.save(userToChallenge.user);
        }
      }
    }
  }
}
