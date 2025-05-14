#!/bin/sh
set -u

# shellcheck disable=SC1091
. ./.env

if [ -z "${PULUMI_ACCESS_TOKEN}" ]; then
  echo "ERROR: PULUMI_ACCESS_TOKEN environment variable is not set." >&2
fi

if [ -z "${DIGITALOCEAN_TOKEN}" ]; then
  echo "ERROR: DIGITALOCEAN_TOKEN environment variable is not set." >&2
fi

stack=$(git rev-parse --abbrev-ref HEAD)
export STACK=${stack}

stack_exists=$(pulumi -C iac/ stack ls -j | jq -r --arg stack ${stack} 'any(.[] ; .name == $stack)')

if [ "${stack_exists}" = "false" ]; then
  echo "Creating stack..."
  pulumi -C iac/ stack init ${stack}
fi

pulumi -C iac/ -s ${stack} up -y
demoBackendUrl=$(pulumi -C iac/ -s ${stack} stack output demoBackendUrl -j | tr -d "\"")
export API_URL=${demoBackendUrl}
node .devcontainer/generateTestData.js

echo "export EXPO_PUBLIC_API_URL=${demoBackendUrl}" > frontend/.env

cd frontend

npm install

npx expo start --tunnel