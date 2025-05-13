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
stack_exists=$(pulumi -C iac/ stack ls -j | jq -r --arg stack ${stack} 'any(.[] ; .name == $stack)')

if [ "${stack_exists}" = "false" ]; then
  echo "Creating stack..."
  pulumi -C iac/ stack init ${stack}
fi

pulumi -C iac/ -s ${stack} up -y
pulumi -C iac/ -s ${stack} stack output demoBackendUrl -j | xargs -I {} echo "export EXPO_PUBLIC_API_URL={}" > frontend/.env

cd frontend

npm install

npx expo start --tunnel