# Ad Placements Integration Documentation

## Overview
This document describes the complete integration of the Ad Placements system in Sooq Mazad platform.

## Database Schema

### Table: `ad_placements`
```prisma
model ad_placements {
  id             String              @id @default(cuid())
  name           String
  description    String?
  location       AdPlacementLocation
  type           AdPlacementType     @default(STATIC)
  status         AdPlacementStatus   @default(ACTIVE)
  maxAds         Int                 @default(1)
  displayOrder   Int                 @default(0)
  autoRotate     Boolean             @default(false)
  rotateInterval Int?
  width          String?
  height         String?
  isActive       Boolean             @default(true)
  startDate      DateTime?
  endDate        DateTime?
  createdAt      DateTime            @default(now())
  updatedAt      DateTime            @updatedAt
  createdBy      String?
  updatedBy      String?
  ads            placement_ads[]
}
```

### Enums

#### AdPlacementLocation
- `HOME_TOP` - Homepage Top Section
- `HOME_MIDDLE` - Homepage Middle Section
- `HOME_BOTTOM` - Homepage Bottom Section
- `MARKETPLACE_TOP` - Marketplace Top
- `MARKETPLACE_BOTTOM` - Marketplace Bottom
- `AUCTIONS_TOP` - Auctions Top
- `AUCTIONS_BOTTOM` - Auctions Bottom
- `TRANSPORT_TOP` - Transport Services Top
- `TRANSPORT_BOTTOM` - Transport Services Bottom
- `YARDS_TOP` - Yards Top
- `YARDS_BOTTOM` - Yards Bottom
- `SIDEBAR` - Sidebar
- `HEADER` - Header
- `FOOTER` - Footer

#### AdPlacementType
- `STATIC` - Static single ad
- `SLIDER` - Slider with multiple ads
- `ROTATING` - Auto-rotating ads
- `GRID` - Grid layout
- `CAROUSEL` - Carousel display

#### AdPlacementStatus
- `ACTIVE` - Active and visible
- `INACTIVE` - Inactive
- `SCHEDULED` - Scheduled for future activation

## API Endpoints

### Base URL: `/api/admin/ad-placements`

#### GET `/api/admin/ad-placements`
Fetch all ad placements with optional search

**Query Parameters:**
- `search` (optional) - Search by name or description

**Response:**
```json
{
  "placements": [
    {
      "id": "cuid123",
      "name": "Homepage Top Banner",
      "description": "Main banner on homepage",
      "location": "HOME_TOP",
      "type": "STATIC",
      "status": "ACTIVE",
      "maxAds": 3,
      "displayOrder": 1,
      "autoRotate": true,
      "rotateInterval": 5,
      "width": "100%",
      "height": "300px",
      "isActive": true,
      "_count": {
        "ads": 2
      }
    }
  ]
}
```

#### POST `/api/admin/ad-placements`
Create a new ad placement

**Request Body:**
```json
{
  "name": "Homepage Top Banner",
  "description": "Main banner on homepage",
  "location": "HOME_TOP",
  "type": "STATIC",
  "maxAds": 3,
  "displayOrder": 1,
  "autoRotate": true,
  "rotateInterval": 5,
  "width": "100%",
  "height": "300px",
  "isActive": true
}
```

**Response:**
```json
{
  "placement": {
    "id": "cuid123",
    ...
  }
}
```

#### GET `/api/admin/ad-placements/[id]`
Fetch a specific ad placement by ID

**Response:**
```json
{
  "placement": {
    "id": "cuid123",
    "name": "Homepage Top Banner",
    ...
    "ads": [
      {
        "id": "ad123",
        "placementId": "cuid123",
        "entityType": "AUCTION",
        "entityId": "auction123",
        "priority": 10
      }
    ]
  }
}
```

#### PUT `/api/admin/ad-placements/[id]`
Update an existing ad placement

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "isActive": false,
  ...
}
```

**Response:**
```json
{
  "placement": {
    "id": "cuid123",
    ...
  }
}
```

#### DELETE `/api/admin/ad-placements/[id]`
Delete an ad placement

**Response:**
```json
{
  "success": true
}
```

## Admin Pages

### List Page: `/admin/promotions/ad-placements`
- **File:** `apps/admin/pages/admin/promotions/ad-placements.tsx`
- **Features:**
  - Search placements
  - View all placements in grid layout
  - Toggle active/inactive status
  - Edit placement
  - Delete placement
  - Create new placement

### Create Page: `/admin/promotions/ad-placements/create`
- **File:** `apps/admin/pages/admin/promotions/ad-placements/create.tsx`
- **Features:**
  - Create new ad placement
  - Set location and type
  - Configure display settings
  - Enable auto-rotation

### Edit Page: `/admin/promotions/ad-placements/[id]`
- **File:** `apps/admin/pages/admin/promotions/ad-placements/[id].tsx`
- **Features:**
  - Load existing placement data
  - Update all placement fields
  - Save changes

## Testing

### Test Script
Run the test script to verify database integration:

```bash
node scripts/test-ad-placement.js
```

This script will:
1. Create a new ad placement
2. Fetch all placements
3. Fetch placement by ID
4. Update placement
5. Delete placement

## Usage Guide

### Creating a New Ad Placement

1. Navigate to `/admin/promotions/ad-placements`
2. Click "Add New Placement" button
3. Fill in the form:
   - Name (required)
   - Description (optional)
   - Location (select from dropdown)
   - Type (select from dropdown)
   - Max Ads (number)
   - Display Order (number)
   - Width/Height (optional)
   - Auto-rotate (checkbox)
   - Rotate interval (if auto-rotate enabled)
   - Active status (checkbox)
4. Click "Create"

### Editing an Existing Placement

1. Navigate to `/admin/promotions/ad-placements`
2. Find the placement you want to edit
3. Click "Edit" button
4. Update the fields
5. Click "Save Changes"

### Deleting a Placement

1. Navigate to `/admin/promotions/ad-placements`
2. Find the placement you want to delete
3. Click "Delete" button
4. Confirm deletion

## Integration Status

✅ **Completed:**
- Database schema created and synchronized
- API routes implemented (GET, POST, PUT, DELETE)
- Admin pages created (list, create, edit)
- Authentication and authorization implemented
- Testing script created and verified

## Placement Ads Management

### Table: `placement_ads`
```prisma
model placement_ads {
  id          String        @id @default(cuid())
  placementId String
  entityType  String
  entityId    String
  priority    Int           @default(0)
  isActive    Boolean       @default(true)
  startDate   DateTime?
  endDate     DateTime?
  clicks      Int           @default(0)
  impressions Int           @default(0)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  placement   ad_placements @relation(fields: [placementId], references: [id], onDelete: Cascade)
}
```

### Placement Ads API Routes

#### GET `/api/admin/placement-ads`
Fetch ads for a specific placement

**Query Parameters:**
- `placementId` - Filter by placement ID
- `entityType` - Filter by entity type
- `isActive` - Filter by active status

#### POST `/api/admin/placement-ads`
Create a new ad in a placement

**Request Body:**
```json
{
  "placementId": "placement-id",
  "entityType": "AUCTION",
  "entityId": "auction-123",
  "priority": 10,
  "isActive": true
}
```

#### GET/PUT/DELETE `/api/admin/placement-ads/[id]`
Get, update, or delete a specific ad

### Placement Ads Management Page
- **URL**: `/admin/promotions/placement-ads/[placementId]`
- **Features**:
  - View all ads for a placement
  - Add new ads (with capacity limit check)
  - Toggle ad active status
  - Delete ads
  - Shows current capacity (X/Y ads)

## Public API

### GET `/api/placements/[location]`
Fetch active placements and their ads for a specific location

**Example:**
```
GET /api/placements/HOME_TOP
```

**Response:**
```json
{
  "placements": [
    {
      "id": "placement-id",
      "name": "Homepage Banner",
      "location": "HOME_TOP",
      "type": "SLIDER",
      "autoRotate": true,
      "rotateInterval": 5,
      "width": "100%",
      "height": "400px",
      "ads": [
        {
          "id": "ad-id",
          "entityType": "AUCTION",
          "entityId": "auction-123",
          "priority": 10
        }
      ]
    }
  ]
}
```

## Frontend Component

### AdPlacement Component
- **File**: `components/AdPlacement.js`
- **Usage**:
```jsx
import AdPlacement from '@/components/AdPlacement';

<AdPlacement location="HOME_TOP" />
```

### Supported Display Types:
1. **STATIC** - Single ad without rotation
2. **SLIDER** - One ad at a time with auto-rotation
3. **ROTATING** - Same as slider with manual controls
4. **GRID** - Multiple ads in grid layout
5. **CAROUSEL** - Horizontal scrollable ads

### Features:
- ✅ Auto-rotation with configurable intervals
- ✅ Manual navigation controls
- ✅ Responsive design
- ✅ Time-based display (startDate/endDate)
- ✅ Priority-based ordering
- ✅ Automatic link generation based on entity type

## Usage Examples

### Homepage
```jsx
export default function HomePage() {
  return (
    <div>
      <AdPlacement location="HOME_TOP" className="mb-8" />
      {/* Page content */}
      <AdPlacement location="HOME_BOTTOM" className="mt-8" />
    </div>
  );
}
```

### Marketplace
```jsx
<AdPlacement location="MARKETPLACE_TOP" />
<div className="grid grid-cols-4">
  <aside>
    <AdPlacement location="SIDEBAR" />
  </aside>
  <main className="col-span-3">
    {/* Content */}
  </main>
</div>
```

## Testing

### Complete System Test
Run the comprehensive test script:

```bash
node scripts/test-ad-system-full.js
```

This script tests:
- ✅ Ad Placements CRUD
- ✅ Placement Ads CRUD
- ✅ Capacity Limits
- ✅ Relations & Includes
- ✅ Filtering & Ordering
- ✅ Status Management
- ✅ Advanced Queries

## Next Steps

To further enhance this system:
1. Add click tracking and analytics
2. Implement A/B testing for ads
3. Add custom ad templates with images
4. Create targeting based on user location/preferences
5. Add impression tracking
6. Implement revenue tracking for paid placements

## Notes

- All API routes require admin authentication
- The system uses cookie-based authentication with JWT
- Database operations use Prisma ORM
- All pages are built with Next.js (Pages Router)
- Styling uses Tailwind CSS
- Icons from Heroicons

## Contact

For questions or issues related to this integration, refer to the main project documentation or contact the development team.
