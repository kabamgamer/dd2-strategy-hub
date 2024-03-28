#!/bin/bash

# Get script directory
SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_DIR="$( cd -- "$(dirname -- "${SCRIPTS_DIR}")" &> /dev/null && pwd )"

# Import variables
source "${SCRIPTS_DIR}/.env"

# Build the project
npm run build

# SSH into the server and remove old assets
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_IP} << EOF
    cd ${SERVER_PATH}
    find assets -type f -delete
EOF

# Copy dist to the server
scp -P "${SERVER_PORT}" -r "${PROJECT_DIR}"/dist/{*,.htaccess} "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}"
