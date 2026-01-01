import * as TabsPrimitive from '@radix-ui/react-tabs';

// Adapter for UI Tabs to keep imports stable without changing design
// Usage: import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export const Tabs = TabsPrimitive.Root;
export const TabsList = TabsPrimitive.List;
export const TabsTrigger = TabsPrimitive.Trigger;
export const TabsContent = TabsPrimitive.Content;

export default Tabs;
