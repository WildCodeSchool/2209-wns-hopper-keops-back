/* eslint-disable @typescript-eslint/no-floating-promises */
import cron from "node-cron";
import { LessThan, MoreThan } from "typeorm";
import { Challenge } from "./entity/Challenge";
import dataSource from "./utils";

async function updateChallengeStatus(): Promise<void> {
  const currentDate = new Date();
  const challengeRepository = dataSource.getRepository(Challenge);
  // Begin of challenges
  const challengesToUpdate = await challengeRepository.find({
    where: {
      is_in_progress: false,
      start_date: LessThan(currentDate),
      end_date: MoreThan(currentDate),
    },
  });
  for (const challenge of challengesToUpdate) {
    challenge.save({ ...challenge, is_in_progress: true });
  }
  // End of challenges
  const endedChallenges = await challengeRepository.find({
    where: { is_in_progress: true, end_date: LessThan(currentDate) },
  });
  for (const challenge of endedChallenges) {
    challenge.save({ ...challenge, is_in_progress: false });
  }
}

export const startTasks = () => {
  cron.schedule("* * * * *", async () => {
    console.log("⌛ Updating challenge status at", new Date());
    await updateChallengeStatus();
    console.log("✅ Challenges status updated at", new Date());
  });
};
