<template>
  <div class="defense-list">
    <ul class="m-0 p-0">
      <li v-for="defense in defenses"
          :key="defense.name"
          class="defense-list__item d-flex align-items-center"
      >
        <div class="defense-count">{{ defense.count }}x</div>
        <div class="defense-icon"></div>
        <div class="defense-name">{{ defense.name }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from "vue"

import type { PropType } from "vue"
import type { MapConfigInterface, MapDefenseInterface } from "@/types";

const props = defineProps({
  map: {
    type: Object as PropType<MapConfigInterface>,
    required: true,
  },
})

const defenses = computed(() => {
  let resolvedDefenses: { name: string, count: number }[] = [];
  const mapConfig = props.map as MapConfigInterface;

  mapConfig.defenses.forEach((defense: MapDefenseInterface) => {
    const defenseCount = mapConfig.mapLayout.filter((layout) => {
      return layout.defenseIncrementId === defense.incrementId;
    }).length;

    if (defenseCount < 1) return;

    resolvedDefenses.push({
      name: defense.label,
      count: defenseCount,
    });
  });

  return resolvedDefenses;
})
</script>

<style lang="scss" scoped>
.defense-list {
  &__item {
    gap: 3px;
  }
}
</style>