#!/bin/bash

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# If deploy fails, try push (for development)
if [ $? -ne 0 ]; then
  echo "Deploy failed, attempting push..."
  npx prisma db push
fi

echo "Database setup complete!"
