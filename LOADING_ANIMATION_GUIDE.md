# Loading Animation Setup Guide

## ✅ What Has Been Implemented

I've set up a global loading animation system that shows before each page loads. Here's what was created:

### 1. **Loading Component** (`src/components/Loading.tsx`)
A reusable loading component that displays your GIF file with customizable options.

### 2. **Page Loading Hook** (`src/hooks/usePageLoading.ts`)
A custom hook that detects route changes and triggers the loading state.

### 3. **Route Loader Component** (`src/components/RouteLoader.tsx`)
A wrapper component for lazy-loaded routes (optional, for future use).

### 4. **Updated App.tsx**
Modified to show loading animation on every page transition.

---

## 📁 Setup Your GIF File

**IMPORTANT:** Place your loading GIF file here:
```
public/assests/loading.gif
```

If you want to use a different filename or location, update line 23 in `src/components/Loading.tsx`:
```tsx
src="/assests/loading.gif"  // Change this path
```

---

## ⚙️ Configuration

### Adjust Loading Duration
In `src/App.tsx`, line 31:
```tsx
const isLoading = usePageLoading(800); // Change 800 to your desired milliseconds
```

### Customize Loading Appearance
In `src/components/Loading.tsx`, you can modify:
- **Size**: Change `w-24 h-24` to any Tailwind size class
- **Background**: Change `bg-white bg-opacity-90` for different overlay styles
- **Message**: The default message is "Loading page..."

---

## 🎨 How It Works

1. **User navigates** to a new page (e.g., clicks a link)
2. **Loading overlay appears** with your GIF animation
3. **After 800ms** (configurable), the overlay fades away
4. **New page content** is displayed

---

## 💡 Additional Usage Examples

### Use Loading in Individual Components

```tsx
import Loading from '@/components/Loading';
import { useState, useEffect } from 'react';

function MyComponent() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  if (isLoading) {
    return <Loading message="Fetching data..." size="medium" />;
  }

  return <div>Your content here</div>;
}
```

### Use Loading for API Calls

```tsx
import Loading from '@/components/Loading';

function DataFetcher() {
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data');
      // Process data...
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <Loading fullScreen message="Loading data..." />}
      {/* Your component content */}
    </div>
  );
}
```

---

## 🎯 Component Props

The `Loading` component accepts these props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | string | "Loading..." | Text shown below the GIF |
| `fullScreen` | boolean | false | If true, covers entire screen |
| `size` | 'small' \| 'medium' \| 'large' | 'medium' | Size of the loading GIF |

### Size Reference:
- `small`: 64px × 64px (w-16 h-16)
- `medium`: 96px × 96px (w-24 h-24)
- `large`: 128px × 128px (w-32 h-32)

---

## 🚀 Testing

1. Make sure your GIF is in `public/assests/loading.gif`
2. Run your dev server: `npm run dev`
3. Navigate between pages to see the loading animation
4. The loading should appear for 800ms on each navigation

---

## 🔧 Troubleshooting

### GIF not showing?
- Check the file path in `src/components/Loading.tsx`
- Ensure the GIF file exists in `public/assests/`
- Clear browser cache and reload

### Loading too fast/slow?
- Adjust the delay in `src/App.tsx`: `usePageLoading(800)` ← change this number

### Want different loading for specific pages?
- You can conditionally render different loading components based on the route
- Or customize the message based on `location.pathname`

---

## 📝 Notes

- The loading animation is **automatically triggered** on all route changes
- No need to manually add loading to each page
- The system uses React Router's location changes to detect navigation
- You can still use the `Loading` component manually in any component for custom loading states

---

Enjoy your new loading animation! 🎉
