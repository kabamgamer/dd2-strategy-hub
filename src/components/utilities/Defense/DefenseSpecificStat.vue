<template>
  <div v-if="stat.template">
    <NetherArcherBouncesStatTemplate :stat="stat" v-if="stat.template === 'NetherArcherBouncesStatTemplate'" />
  </div>
  <span v-else class="w-100 defense-info__header-stats__stat">
    <strong>{{ stat.label }}:</strong> {{ stat.value }}
  </span>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

import type { PropType } from "vue";
import type { DefenseStatInterface } from "@/interaces";

import NetherArcherBouncesStatTemplate from "@/defense_stats/templates/NetherArcherBouncesStatTemplate.vue";

defineProps({
  stat: {
    type: Object as PropType<DefenseStatInterface>,
    required: true,
  },
})
</script>
