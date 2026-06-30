import { inngest } from "@/lib/inngest/client";
import { executeAgenticTask } from "@/lib/agents/execution";

export const executeTask = inngest.createFunction(
  { id: "execute-task", triggers: [{ event: "agent/execute.task" }] },
  async ({ event, step }: { event: any, step: any }) => {
    const { taskId, commitmentId, userId, title, type } = event.data;

    // Simulate thinking/delay for better UX feedback in the frontend
    await step.sleep("wait-a-moment", "2s");

    const result = await step.run("execute-agent-logic", async () => {
      console.log(`Executing task ${taskId}: ${title}`);
      return await executeAgenticTask({ taskId, commitmentId, userId, title, type });
    });

    return result;
  }
);
