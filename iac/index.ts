import * as digitalocean from "@pulumi/digitalocean";

const demoDatabase = new digitalocean.DatabaseCluster("demoDatabase", {
  nodeCount: 1,
  engine: "pg",
  size: digitalocean.DatabaseSlug.DB_1VPCU1GB,
  region: digitalocean.Region.FRA1,
  name: "main",
  projectId: "c1cf44a6-cd57-41bf-b95b-f6a60efed99c",
  version: "17",
});

const demoBackend = new digitalocean.App("demoBackend", {
  projectId: "c1cf44a6-cd57-41bf-b95b-f6a60efed99c",
  spec: {
    envs: [
      {
        key: "DB_USER",
        value: demoDatabase.user,
      },
      {
        key: "DB_PASSWORD",
        value: demoDatabase.password,
      },
      {
        key: "DB_HOST",
        value: demoDatabase.host,
      },
      {
        key: "DB_NAME",
        value: demoDatabase.database,
      },
      {
        key: "DB_PORT",
        value: demoDatabase.port.apply(port => port.toString()),
      },
    ],
    name: "demo-backend",
    services: [{
      name: "demo-backend",
      instanceCount: 1,
      instanceSizeSlug: "apps-s-1vcpu-0.5gb",
      git: {
        repoCloneUrl: "https://github.com/chrstphfrtz/how-iac-can-help-you-speed-up-development-and-testing-demo.git",
        branch: "main"
      },
      sourceDir: "backend"
    }]
  }
})

export const demoBackendUrl = demoBackend.liveUrl;

const demoFirewall = new digitalocean.DatabaseFirewall("demoFirewall", {
  clusterId: demoDatabase.id,
  rules: [{
    type: "app",
    value: demoBackend.id
  }]
})