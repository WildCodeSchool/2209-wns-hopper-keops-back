/* eslint-disable @typescript-eslint/no-floating-promises */
import cron from "node-cron";
import { LessThan, Repository } from "typeorm";
import { Challenge } from "./entity/Challenge";
import dataSource from "./utils";

async function declareChallengesBegining(
  currentDate: Date,
  repository: Repository<Challenge>
): Promise<void> {
  console.log(
    "✅ IDs of challenges to update for is_in_progress: false => true :"
  );
  const challengesToUpdate = await repository.find({
    where: {
      is_in_progress: false,
      start_date: LessThan(currentDate),
    },
  });

  if (challengesToUpdate.length === 0) {
    console.log("Nothing to change");
  }

  for (const challenge of challengesToUpdate) {
    const endDate =
      challenge.start_date.getTime() + challenge.length * 24 * 60 * 60 * 1000;

    if (currentDate.getTime() < endDate) {
      challenge.is_in_progress = true;
      await repository.save(challenge);
      console.log(challenge.id);
    }
  }
}

async function declareChallengesEnding(
  currentDate: Date,
  repository: Repository<Challenge>
): Promise<void> {
  console.log(
    "✅ IDs of challenges to update for is_in_progress: true => false : "
  );
  const endedChallenges = await repository.find({
    where: { is_in_progress: true },
  });

  if (endedChallenges.length === 0) {
    console.log("Nothing to change");
  }
  for (const challenge of endedChallenges) {
    const endDate =
      challenge.start_date.getTime() + challenge.length * 24 * 60 * 60 * 1000;

    if (currentDate.getTime() > endDate) {
      challenge.is_in_progress = false;
      await repository.save(challenge);
      console.log(challenge.id);
    } else {
      console.log(`Challenge ${challenge.id} in progress !`);
    }
  }
}

async function updateChallengeStatus(): Promise<void> {
  const currentDate = new Date();
  const challengeRepository = dataSource.getRepository(Challenge);

  await declareChallengesBegining(currentDate, challengeRepository);

  await declareChallengesEnding(currentDate, challengeRepository);
}

export async function startTasks(): Promise<void> {
  cron.schedule("0 1 0 * * *", async () => {
    console.log("⌛ Updating challenge status at", new Date());
    await updateChallengeStatus();
    console.log("✅ Challenges status updated at", new Date());
  });
}
