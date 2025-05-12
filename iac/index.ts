import * as digitalocean from "@pulumi/digitalocean";

const demoBackend = new digitalocean.App("demoBackend", {
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
    name: "demo-backend",
    services: [{
      name: "demo-backend",
      instanceCount: 1,
      instanceSizeSlug: "apps-s-1vcpu-1gb",
      git: {
        repoCloneUrl: "https://github.com/chrstphfrtz/how-iac-can-help-you-speed-up-development-and-testing-demo.git",
        branch: "main"
      },
      sourceDir: "backend"
    }]
  }
})