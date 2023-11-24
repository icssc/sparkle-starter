import { SvelteKit } from "@svelte.kit/cdk";
import { App, Stack } from "aws-cdk-lib";

async function main() {
  const stackName = `sparkle-starter-canary`;

  const app = new App({ autoSynth: true });

  const stack = new Stack(app, stackName);

  new SvelteKit(stack, stackName);
}

main();
