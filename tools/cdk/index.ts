import { SvelteKit } from "@svelte.kit/cdk";
import { App, Stack } from "aws-cdk-lib";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";

async function main() {
  const stackName = `sparkle-starter-canary`;

  const app = new App({ autoSynth: true });

  const stack = new Stack(app, stackName);

  const sveltekit = new SvelteKit(stack, stackName);

  const stage = process.env.STAGE ?? "dev";

  if (!process.env.CERTIFICATE_ARN) {
    throw new Error("Certificate ARN not provided.");
  }

  new ARecord(stack, "a-record", {
    zone: HostedZone.fromHostedZoneAttributes(stack, "peterportal-hosted-zone", {
      zoneName: `${stage === "prod" ? "" : `${stage}.`}zotmeet.com`,
      hostedZoneId: process.env.HOSTED_ZONE_ID ?? "",
    }),
    recordName: `${stage === "prod" ? "" : `${stage}.`}api-next`,
    target: RecordTarget.fromAlias(new CloudFrontTarget(sveltekit.distribution)),
  });
}

main();
