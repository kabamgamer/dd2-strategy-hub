<template>
  <div class="card" :class="{'h-100': maxHeight}">
    <div class="card-header"><slot name="header">{{ cardTitle }}</slot></div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

defineProps({
  cardTitle: String,
  component: Object,
  maxHeight: {
    type: Boolean,
    default: true,
  },
})
</script>
