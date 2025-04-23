#!/bin/sh
echo "Starting Container"

# Debug print all KINDE env vars
echo "KINDE_ISSUER_URL: $KINDE_ISSUER_URL"
echo "KINDE_CLIENT_ID: $KINDE_CLIENT_ID"

exec bun run server/index.ts