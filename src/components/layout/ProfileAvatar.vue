<template>
  <div
    :class="[
      'relative shrink-0 overflow-hidden rounded-full bg-fc-50',
      sizeClass,
    ]"
    :title="altText"
  >
    <img
      v-if="photoUrl && !imageFailed"
      :key="photoUrl"
      :src="photoUrl"
      :alt="altText"
      referrerpolicy="no-referrer"
      class="h-full w-full object-cover"
      @error="imageFailed = true"
    />
    <div
      v-else
      class="flex h-full w-full items-center justify-center font-semibold text-fc-700"
      :class="textClass"
      aria-hidden="true"
    >
      {{ initials }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  photoUrl?: string | null;
  displayName?: string | null;
  email?: string | null;
  sizeClass?: string;
  textClass?: string;
}>(), {
  photoUrl: null,
  displayName: null,
  email: null,
  sizeClass: 'h-8 w-8',
  textClass: 'text-sm',
});

const imageFailed = ref(false);

const altText = computed(() => props.displayName || props.email || 'User profile');
const initials = computed(() => {
  const source = props.displayName?.trim() || props.email?.split('@')[0] || 'U';
  const words = source.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
});

watch(() => props.photoUrl, () => {
  imageFailed.value = false;
});
</script>
