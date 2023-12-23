<template>
  <div class="section pt-3 pb-3">
    <div class="d-flex justify-content-between align-items-center">
      <h2 class="section__title">{{ sectionTitle }}</h2>

      <slot name="title-row" />
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

defineProps({
  sectionTitle: String
})
</script>
