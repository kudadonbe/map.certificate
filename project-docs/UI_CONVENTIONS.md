# UI Conventions

## Icons

### Usage Rules

- **DO NOT use emojis** in the UI
- **DO use Heroicons** for all icons
- **DO NOT create custom SVG files** for icons

### Heroicons

This project uses [Heroicons](https://heroicons.com/) as the standard icon library:

- **Outline icons**: For regular UI elements (24x24)
- **Solid icons**: For emphasis and filled states (20x20)
- **Mini icons**: For compact spaces (20x20)

### Implementation

```vue
<!-- Import from @heroicons/vue -->
<script setup>
import { UserIcon, DocumentIcon } from '@heroicons/vue/24/outline'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
</script>

<template>
  <UserIcon class="w-6 h-6" />
  <CheckCircleIcon class="w-5 h-5 text-green-500" />
</template>
```

### Why Heroicons?

- ✅ Professionally designed
- ✅ Consistent styling across UI
- ✅ Maintained by Tailwind Labs
- ✅ Available as Vue components
- ✅ Tree-shakeable (only imports what's used)
- ✅ Optimized for Tailwind CSS

## Typography

- Use Tailwind typography utilities
- Follow bilingual support (English & Dhivehi)

## Colors

- Use theme colors defined in template system
- Follow Tailwind color palette conventions
