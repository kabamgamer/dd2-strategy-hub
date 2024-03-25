<template>
  <div v-if="stat.template">
    <NetherArcherBouncesStatTemplate :stat="stat" v-if="stat.template === 'NetherArcherBouncesStatTemplate'" />
  </div>
  <span v-else class="w-100 defense-info__header-stats__stat">
    <strong>{{ stat.label }}:</strong> <template v-if="!stat.critDamage || !stat.attackDamage">{{ stat.value }}</template>
    <HtmlTooltip class="html-tooltip--critical-tooltip" v-else>
      <template #trigger><span class="tooltip__text">{{ stat.value }}</span></template>
      <span class="html-tooltip__text--non-critical">Non-crit: {{ Math.round(stat.attackDamage).toLocaleString('en-US') }}</span> <br />
      <span class="html-tooltip__text--critical">Crit: {{ Math.round(stat.critDamage).toLocaleString('en-US') }}</span>
    </HtmlTooltip>
  </span>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

import type { PropType } from "vue";
import type { DefenseStatInterface } from "@/types";

import NetherArcherBouncesStatTemplate from "@/defense_stats/templates/NetherArcherBouncesStatTemplate.vue";
import HtmlTooltip from '@/components/layout/HtmlTooltip.vue';

defineProps({
  stat: {
    type: Object as PropType<DefenseStatInterface<any>>,
    required: true,
  },
})
</script>
