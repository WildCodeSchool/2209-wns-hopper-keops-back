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
    if (
      event.databaseEntity.is_in_progress &&
      event.databaseEntity.end_date < new Date()
    ) {
      // Connection to the repositories
      const repositoryChallenge = event.manager.getRepository(Challenge);
      const repositoryUser = event.manager.getRepository(User);

      // Find the challenge in db with all the users
      const challenge = await repositoryChallenge.findOne({
        where: { id: event.entity?.id },
        relations: ["userToChallenges", "userToChallenges.user"],
      });

      // When challenge was found and the status is toggling to 'Terminé' in the last updtate so update global score of each user nether nothing appened
      if (challenge !== null && !challenge.is_in_progress) {
        for (const userToChallenge of challenge.userToChallenges) {
          console.log("===> OLD SCORE: ", userToChallenge.user.score);
          userToChallenge.user.score += userToChallenge.challengeScore;
          await repositoryUser.save(userToChallenge.user);
          console.log("===> NEW SCORE: ", userToChallenge.user.score);
        }
      }
    }
  }
}
