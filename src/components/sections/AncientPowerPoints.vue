<template>
  <div class="row ancient-power-points">
    <div class="col ancient-power-points__point mb-3 " v-for="ancientPower in ancientPowers" :key="ancientPower.id">
      <Card class="ancient-power-points__card" :cardTitle="ancientPower.name">
        <img :src="ancientPower.icon" :alt="'Ancient ' + ancientPower.name">

        <div class="input-group">
          <input type="number" min="0" max="10" v-model="ancientPowerPoints[ancientPower.id]" class="form-control ancient-power-reset" @change="ensureValidLevel(ancientPower.id)">
          <div class="input-group-append">
            <span class="input-group-text">/<a class="link" @click.prevent="ancientPowerPoints[ancientPower.id] = 10">10</a></span>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from "@/components/layout/Card.vue";

import { storeToRefs } from "pinia";
import ancientPowers from "@/data/AncientPowers";
import { useUserDataStore } from "@/stores/UserData";

const { ancientPowerPoints } = storeToRefs(useUserDataStore());

function ensureValidLevel(id: string): void {
  const level: number = ancientPowerPoints.value[id];
  ancientPowerPoints.value[id] = level < 0 ? 0 : level > 10 ? 10 : level;
}
</script>

<style lang="scss" scoped>
/* for every point: 2 columns on small mobile, 3 bigger mobile devices, 4 tablet, 7 desktop */
.ancient-power-points {
  &__point {
    flex: 0 0 50%;
  }

  &__card {
    img, .input-group {
      max-width: 119px;
    }
  }
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

.link {
  cursor: pointer;
}
</style>
