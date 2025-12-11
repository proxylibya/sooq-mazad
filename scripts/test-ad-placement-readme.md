# Ad Placements Testing Script

## Overview
This script tests the full CRUD operations for the ad_placements table in the database.

## Usage

```bash
node scripts/test-ad-placement.js
```

## What It Tests

1. **CREATE** - Creates a new ad placement with sample data
2. **READ ALL** - Fetches all placements from the database
3. **READ ONE** - Fetches a specific placement by ID with related data
4. **UPDATE** - Updates the placement with new data
5. **DELETE** - Deletes the test placement

## Expected Output

```
Testing ad_placements...

1. Creating a new ad placement...
✓ Created placement: [ID]
  Name: Test Placement - Home Top Banner
  Location: HOME_TOP
  Type: STATIC

2. Fetching all placements...
✓ Found X placement(s)
  1. Test Placement - Home Top Banner (HOME_TOP) - ACTIVE

3. Fetching placement by ID...
✓ Found placement: Test Placement - Home Top Banner
  ID: [ID]
  Ads count: 0

4. Updating placement...
✓ Updated placement
  New description: Updated description for testing
  New display order: 5

5. Deleting test placement...
✓ Deleted placement: [ID]

✅ All tests passed successfully!
```

## Notes

- This script connects directly to the database using Prisma
- All test data is cleaned up after execution
- The script will fail if the database schema is not synchronized
- Make sure PostgreSQL is running before executing the script

## Troubleshooting

### Database Connection Error
Make sure your `.env` file has the correct `DATABASE_URL`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/sooq_mazad"
```

### Schema Not Synchronized
Run the following command to sync the schema:
```bash
npx prisma db push
```

### Prisma Client Not Generated
Run the following command to generate the client:
```bash
npx prisma generate
```
