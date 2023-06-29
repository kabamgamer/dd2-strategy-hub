<template>
  <div class="section pt-3 pb-3">
    <h2 class="section__title">{{ sectionTitle }}</h2>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

defineProps({
  sectionTitle: String
})
</script>
