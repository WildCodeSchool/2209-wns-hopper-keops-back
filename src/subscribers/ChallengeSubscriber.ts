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
   * Called before Challenge insertion.
   */
  async afterUpdate(event: UpdateEvent<Challenge>): Promise<void> {
    console.log(`AFTER Challenge UPDATE: `, event.entity);

    // Connection to the repositories
    const repositoryChallenge = event.connection.getRepository(Challenge);
    const repositoryUser = event.connection.getRepository(User);

    // Find the challenge in db with all the users
    const challenge = await repositoryChallenge.findOne({
      where: { id: event.entity?.id },
      relations: ["userToChallenges", "userToChallenges.user"],
    });

    // When challenge was found and the status is Terminé update global score of each user nether nothing appened
    if (challenge !== null && challenge.status === "Terminé") {
      console.log("The Challenge :", challenge.status);
      console.log("All users :", challenge.userToChallenges);

      for (const userToChallenge of challenge.userToChallenges) {
        userToChallenge.user.score += userToChallenge.challengeScore;
        console.log("User score changed :", userToChallenge.user.score);
        await repositoryUser.save(userToChallenge.user);
      }
    }
  }
}
