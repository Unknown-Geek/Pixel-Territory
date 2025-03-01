import { Devvit } from "@devvit/public-api";
import { createNewGameState } from "./utils/gameState";

Devvit.addSchedulerHandler({
  name: "dailyReset",
  onRun: async (context) => {
    const newState = createNewGameState();
    await context.redis.set("gameState", JSON.stringify(newState));

    const previousState = await context.redis.get("gameState");
    if (previousState) {
      const date = new Date().toISOString().split("T")[0];
      await context.redis.set(`gameState-${date}`, previousState);
    }
  },
});

Devvit.schedule({
  handler: "dailyReset",
  cron: "0 0 * * *", // Run at midnight UTC daily
});

export default Devvit;
