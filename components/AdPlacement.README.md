# AdPlacement Component

## Overview
A React component for displaying advertisements in different locations across the website. Supports multiple display types including static, slider, rotating, grid, and carousel layouts.

## Features
- **Multiple Display Types**: Static, Slider, Rotating, Grid, and Carousel
- **Auto-Rotation**: Automatic content rotation with customizable intervals
- **Responsive Design**: Adapts to different screen sizes
- **Priority-Based Ordering**: Displays ads based on priority settings
- **Time-Based Display**: Shows ads only within their scheduled date range
- **Seamless Integration**: Easy to integrate in any page

## Usage

### Basic Usage
```jsx
import AdPlacement from '@/components/AdPlacement';

export default function HomePage() {
  return (
    <div>
      <AdPlacement location="HOME_TOP" />
      
      <main>
        {/* Your page content */}
      </main>
      
      <AdPlacement location="HOME_BOTTOM" />
    </div>
  );
}
```

### With Custom Styling
```jsx
<AdPlacement 
  location="MARKETPLACE_TOP" 
  className="my-8 px-4"
/>
```

## Available Locations

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

## Display Types

### 1. Static
Displays a single ad without rotation.
```jsx
<AdPlacement location="HEADER" />
```

### 2. Slider / Rotating
Displays one ad at a time with automatic rotation.
```jsx
<AdPlacement location="HOME_TOP" />
```
- Shows navigation dots for manual selection
- Auto-rotates based on configured interval

### 3. Grid
Displays multiple ads in a grid layout.
```jsx
<AdPlacement location="MARKETPLACE_TOP" />
```
- Responsive grid (2 columns on mobile, 3 on desktop)

### 4. Carousel
Displays ads in a horizontal scrollable carousel.
```jsx
<AdPlacement location="AUCTIONS_BOTTOM" />
```
- Horizontal scroll
- Fixed ad dimensions

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `location` | `string` | Required | The placement location identifier |
| `className` | `string` | `''` | Additional CSS classes |

## API Integration

The component fetches data from:
```
GET /api/placements/[location]
```

**Response Format:**
```json
{
  "placements": [
    {
      "id": "placement-id",
      "name": "Placement Name",
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

## Supported Entity Types

The component automatically generates links based on entity type:

- **AUCTION** → `/auctions/[entityId]`
- **CAR** → `/cars/[entityId]`
- **SHOWROOM** → `/showrooms/[entityId]`
- **TRANSPORT** → `/transport/[entityId]`
- **YARD** → `/yards/[entityId]`

## Examples

### Homepage Implementation
```jsx
import AdPlacement from '@/components/AdPlacement';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Top Banner */}
      <AdPlacement location="HOME_TOP" className="mb-8" />
      
      {/* Featured Auctions Section */}
      <section className="container mx-auto">
        <h2>مزادات مميزة</h2>
        {/* Auctions content */}
      </section>
      
      {/* Middle Ad Section */}
      <AdPlacement location="HOME_MIDDLE" className="my-12" />
      
      {/* More Content */}
      <section className="container mx-auto">
        {/* More content */}
      </section>
      
      {/* Bottom Ad Section */}
      <AdPlacement location="HOME_BOTTOM" className="mt-12 mb-8" />
    </div>
  );
}
```

### Marketplace Implementation
```jsx
export default function MarketplacePage() {
  return (
    <>
      <AdPlacement location="MARKETPLACE_TOP" />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Ads */}
        <aside>
          <AdPlacement location="SIDEBAR" />
        </aside>
        
        {/* Main Content */}
        <main className="md:col-span-3">
          {/* Marketplace content */}
        </main>
      </div>
      
      <AdPlacement location="MARKETPLACE_BOTTOM" className="mt-8" />
    </>
  );
}
```

## Styling

The component uses Tailwind CSS classes by default. You can customize the appearance by:

1. **Passing custom classes**:
```jsx
<AdPlacement 
  location="HOME_TOP" 
  className="rounded-2xl shadow-lg" 
/>
```

2. **Overriding in your CSS**:
```css
.ad-placement-container {
  /* Your custom styles */
}
```

## Performance Considerations

- The component only fetches data when mounted
- Auto-rotation intervals are cleaned up on unmount
- Only active and time-appropriate ads are displayed
- Loading state is shown while fetching data

## Notes

- The component returns `null` if no placements are available
- A loading spinner is shown while fetching data
- All ads link to their respective entity pages
- Click tracking can be implemented via the onClick handler

## Admin Management

To manage ad placements and ads:

1. Navigate to `/admin/promotions/ad-placements`
2. Create or edit placements
3. Add ads to placements via "إدارة الإعلانات" button
4. Configure display settings, rotation, and scheduling

## Future Enhancements

- Click tracking and analytics
- A/B testing support
- Advanced targeting based on user location
- Performance optimization with server-side rendering
- Custom ad templates for different entity types
