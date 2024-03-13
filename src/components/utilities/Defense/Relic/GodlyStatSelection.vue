<template>
  <div class="form-group mb-3">
    <label v-if="!hideLabel">Relic godly stat</label>
    <select class="form-select" @change="onGodlyStatSelect">
      <option value="none">No godly stat</option>
      <option v-for="(godlyStatLabel, godlyStatType) in getGodlyTypes()"
              :key="godlyStatType"
              :value="godlyStatType"
              :selected="godlyStatType.toString() === modelValue"
      >{{ godlyStatLabel }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue"

import { useGodlyStat } from "@/composables/GodlyStat"

const { getGodlyTypes } = useGodlyStat()

defineProps({
  modelValue: String,
  hideLabel: Boolean,
})

const emit = defineEmits(['update:modelValue', 'change'])

function onGodlyStatSelect(event: Event): void {
  const newValue: string = (event.target as HTMLSelectElement).value
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>