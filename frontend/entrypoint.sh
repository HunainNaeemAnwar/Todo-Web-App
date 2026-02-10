#!/bin/sh
set -e

# Replace placeholder environment variables with actual values
# This script runs at container startup to inject runtime environment variables

echo "Replacing environment variables in Next.js build..."

# Replace NEXT_PUBLIC_API_BASE_URL
if [ -n "$NEXT_PUBLIC_API_BASE_URL" ]; then
  echo "Setting NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL"
  find /app/.next /app/public -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i "s|APP_NEXT_PUBLIC_API_BASE_URL|$NEXT_PUBLIC_API_BASE_URL|g" {} +
fi

# Replace NEXT_PUBLIC_CHATKIT_API_URL
if [ -n "$NEXT_PUBLIC_CHATKIT_API_URL" ]; then
  echo "Setting NEXT_PUBLIC_CHATKIT_API_URL=$NEXT_PUBLIC_CHATKIT_API_URL"
  find /app/.next /app/public -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i "s|APP_NEXT_PUBLIC_CHATKIT_API_URL|$NEXT_PUBLIC_CHATKIT_API_URL|g" {} +
fi

# Replace NEXT_PUBLIC_CHATKIT_DOMAIN_KEY
if [ -n "$NEXT_PUBLIC_CHATKIT_DOMAIN_KEY" ]; then
  echo "Setting NEXT_PUBLIC_CHATKIT_DOMAIN_KEY=$NEXT_PUBLIC_CHATKIT_DOMAIN_KEY"
  find /app/.next /app/public -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i "s|APP_NEXT_PUBLIC_CHATKIT_DOMAIN_KEY|$NEXT_PUBLIC_CHATKIT_DOMAIN_KEY|g" {} +
fi

# Replace NEXT_PUBLIC_BETTER_AUTH_URL
if [ -n "$NEXT_PUBLIC_BETTER_AUTH_URL" ]; then
  echo "Setting NEXT_PUBLIC_BETTER_AUTH_URL=$NEXT_PUBLIC_BETTER_AUTH_URL"
  find /app/.next /app/public -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i "s|APP_NEXT_PUBLIC_BETTER_AUTH_URL|$NEXT_PUBLIC_BETTER_AUTH_URL|g" {} +
fi

echo "Environment variables replaced successfully!"
echo "Starting Next.js application..."

# Execute the main command
exec "$@"
