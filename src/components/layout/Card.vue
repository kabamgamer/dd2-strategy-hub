<template>
  <div class="card h-100">
    <div class="card-header">{{ cardTitle }}</div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

defineProps({
  cardTitle: String,
  component: Object
})
</script>
