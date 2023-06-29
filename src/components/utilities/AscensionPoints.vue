<template>
  <div class="pet">
    <h5>Ascension</h5>
    <div class="row">
      <div class="col-md-4" v-for="ascensionPoint in ascensionPoints" :key="ascensionPoint.id">
        <label>{{ ascensionPoint.label }}</label>
        <div class="reroll-trackers__tracker_count input-group mb-3" style="max-width: 125px">
          <input type="number" min="0" :max="ascensionPoint.maxLevel" v-model="modelValue[ascensionPoint.id]" class="form-control ascension-point">
          <div class="input-group-append">
            <span class="input-group-text">/<a href="#" @click.prevent="assignMax(ascensionPoint)">{{ ascensionPoint.maxLevel }}</a></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { AscensionPointInterface } from '@/interaces'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  ascensionPoints: {
    type: Array as () => AscensionPointInterface[],
    default: () => ([])
  },
})

function assignMax(ascensionPoint: AscensionPointInterface): void {
  props.modelValue[ascensionPoint.id] = ascensionPoint.maxLevel
}
</script>

<style scoped>
  .ascension-point,
  .ascension-point + .input-group-append .input-group-text {
    padding: 5px;
  }
</style>
