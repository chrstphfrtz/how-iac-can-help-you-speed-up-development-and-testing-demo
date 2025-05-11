import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";

// const demoDatabaseCluster = new digitalocean.DatabaseCluster("demoDatabaseCluster", {
//   nodeCount: 1,
//   engine: "pg",
//   size: digitalocean.DatabaseSlug.DB_1VPCU1GB,
//   region: digitalocean.Region.FRA1,
//   name: "main",
//   projectId: "c1cf44a6-cd57-41bf-b95b-f6a60efed99c",
//   version: "17",
// });

const demoFunction = new digitalocean.App("demoFunction", {
  projectId: "c1cf44a6-cd57-41bf-b95b-f6a60efed99c",
  spec: {
    databases: [{
      name: "db",
      engine: "PG",
      production: false,
      version: "17"
    }],
    envs: [
      {
        key: "DB_USER",
        value: "${db.USERNAME}",
      },
      {
        key: "DB_PASSWORD",
        value: "${db.PASSWORD}",
      },
      {
        key: "DB_HOST",
        value: "${db.HOSTNAME}",
      },
      {
        key: "DB_NAME",
        value: "${db.DATABASE}",
      },
      {
        key: "DB_PORT",
        value: "${db.PORT}",
      },
    ],
    name: "demo-function",
    functions: [{
      name: "todos",
      git: {
        repoCloneUrl: "https://github.com/chrstphfrtz/how-iac-can-help-you-speed-up-development-and-testing-demo.git",
        branch: "main"
      },
      sourceDir: "backend"
    }],
  }
})

// const demoFirewall = new digitalocean.DatabaseFirewall("demoFirewall", {
//   clusterId: demoDatabaseCluster.id,
//   rules: [{
//     type: "app",
//     value: demoFunction.id
//   }]
// })
