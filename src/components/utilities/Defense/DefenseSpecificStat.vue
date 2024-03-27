<template>
  <div v-if="stat.template">
    <NetherArcherBouncesStatTemplate :only-value="tableView" :stat="stat" v-if="stat.template === 'NetherArcherBouncesStatTemplate'" />
  </div>
  <component :is="tableView ? 'td' : 'span'" v-else class="w-100 defense-info__header-stats__stat">
    <strong v-if="!tableView">{{ stat.label }}:</strong> <template v-if="!stat.critDamage || !stat.attackDamage">{{ stat.value }}</template>
    <HtmlTooltip class="html-tooltip--critical-tooltip" v-else>
      <template #trigger><span class="tooltip__text">{{ stat.value }}</span></template>
      <span class="html-tooltip__text--non-critical">Non-crit: {{ Math.round(stat.attackDamage).toLocaleString('en-US') }}</span> <br />
      <span class="html-tooltip__text--critical">Crit: {{ Math.round(stat.critDamage).toLocaleString('en-US') }}</span>
    </HtmlTooltip>
  </component>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

import type { PropType } from "vue";
import type { DefenseStatInterface } from "@/types";

import NetherArcherBouncesStatTemplate from "@/defense_stats/templates/NetherArcherBouncesStatTemplate.vue";
import HtmlTooltip from '@/components/layout/HtmlTooltip.vue';

defineProps({
  tableView: Boolean,
  stat: {
    type: Object as PropType<DefenseStatInterface<any>>,
    required: true,
  },
})
</script>
