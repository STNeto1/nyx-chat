import { StackContext, StaticSite, use } from "sst/constructs";
import { API } from "./Api";

export function Web({ stack }: StackContext) {
  const api = use(API);

  const site = new StaticSite(stack, "site", {
    path: "packages/client",
    buildOutput: "dist",
    buildCommand: "npm run build",
    environment: {
      VITE_APP_API_URL: api.url,
    },
  });

  stack.addOutputs({
    SiteUrl: site.url,
  });

  return site;
}
