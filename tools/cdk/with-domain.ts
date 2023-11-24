import { SvelteKit } from "@svelte.kit/cdk";
import { App, Stack } from "aws-cdk-lib";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";

function getStage() {
  if (!process.env.NODE_ENV) {
    throw new Error("NODE_ENV not set.");
  }

  switch (process.env.NODE_ENV) {
    case "production":
      return "prod";

    case "staging":
      if (!process.env.PR_NUM) {
        throw new Error("NODE_ENV was set to staging, but a PR number was not provided.");
      }
      return `staging-${process.env.PR_NUM}`;

    case "development":
      return "dev";

    default:
      throw new Error(
        "Invalid NODE_ENV specified. Valid values are 'production', 'staging', and 'development'.",
      );
  }
}

/**
 * This CDK app extends the simple example in tools/cdk/index.ts by
 * provisioning a custom domain via AWS Route53.
 *
 * All the provisioned constructs are available on the SvelteKit construct after its initialization,
 * which allows them to be used later in the CDK app.
 */
async function main() {
  const stackName = `sparkle-starter-canary`;

  const app = new App({ autoSynth: true });

  const stack = new Stack(app, stackName);

  const sveltekit = new SvelteKit(stack, stackName);

  const stage = getStage();

  if (!process.env.CERTIFICATE_ARN) {
    throw new Error("Certificate ARN not provided.");
  }

  /**
   * Use the CloudFront Distribution provisioned by the SvelteKit construct as the target for the A record.
   */
  const aliasTarget = new CloudFrontTarget(sveltekit.distribution);

  new ARecord(stack, "a-record", {
    zone: HostedZone.fromHostedZoneAttributes(stack, "hosted-zone", {
      zoneName: "sparkle.com",
      hostedZoneId: process.env.HOSTED_ZONE_ID ?? "",
    }),
    recordName: `${stage === "prod" ? "" : `${stage}.`}sparkle`,
    target: RecordTarget.fromAlias(aliasTarget),
  });
}

main();
