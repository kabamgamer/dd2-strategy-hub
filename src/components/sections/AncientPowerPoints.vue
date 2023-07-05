<template>
  <div class="row ancient-power-points">
    <div class="col ancient-power-points__point mb-3 " v-for="ancientPowerPoint in ancientPowerPoints" :key="ancientPowerPoint.id">
      <Card :cardTitle="ancientPowerPoint.name">
        <img style="max-width: 119px" :src="ancientPowerPoint.icon" :alt="'Ancient ' + ancientPowerPoint.name">

        <div class="input-group" style="max-width: 119px">
          <input type="number" min="0" max="10" v-model="modelValue[ancientPowerPoint.id]" class="form-control ancient-power-reset" @change="ensureValidLevel(ancientPowerPoint.id)">
          <div class="input-group-append">
            <span class="input-group-text">/10</span>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import type { PropType } from "vue";
import Card from "@/components/layout/Card.vue";

import ancientPowerPoints from "@/data/AncientPowers";
import type { UserAncientResetPoints } from "@/data/AncientPowers";

const props = defineProps({
  modelValue: {
    type: Object as PropType<UserAncientResetPoints>,
    required: true,
  },
});

function ensureValidLevel(id: string): void {
  const level: number = (props.modelValue as UserAncientResetPoints)[id];
  (props.modelValue as UserAncientResetPoints)[id] = level < 0 ? 0 : level > 10 ? 10 : level;
}
</script>

<style scoped>
/* for every point: 2 columns on small mobile, 3 bigger mobile devices, 4 tablet, 7 desktop */
.ancient-power-points__point {
  flex: 0 0 50%;
}

@media (min-width: 425px) {
  .ancient-power-points__point {
    flex: 0 0 calc(100% / 3);
  }
}

@media (min-width: 768px) {
  .ancient-power-points__point {
    flex: 0 0 25%;
  }
}

@media (min-width: 992px) {
  .ancient-power-points__point {
    flex: 0 0 calc(100% / 7);
  }
}
</style>
