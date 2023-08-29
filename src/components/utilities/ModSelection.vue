<template>
  <select class="form-select" v-model="selectedMod">
    <option :value="mod" v-for="mod in compatibleMods" :key="mod.name">{{ mod.name }}</option>
  </select>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { defineProps, defineEmits, watch, ref, computed } from 'vue'
import type { ModInterface } from '@/interaces'

import { useModStore } from "@/stores/ModInfo";
const { getAllMods } = useModStore();

const props = defineProps({
  modelValue: Object as PropType<ModInterface | null>,
  defenseCompatibility: String,
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectedMod = ref<ModInterface|null>(null)
const allMods = ref<ModInterface[]>([])
const compatibleMods = computed((): ModInterface[] => {
  if (props.defenseCompatibility === '') return allMods.value || [];

  return allMods.value.filter((mod: ModInterface): boolean => {
    if (mod.compatibilities === undefined) return true;

    return mod.compatibilities.includes(props.defenseCompatibility);
  })
});

getAllMods().then((mods: ModInterface[]): void => {
  allMods.value = mods
})

watch(props.modelValue as any, (newValue: any): void => {
  selectedMod.value = newValue
}, { deep: true })

watch(selectedMod, (newValue: ModInterface | null): void => {
  if (newValue === null) return

  emit('update:modelValue', newValue)
  emit('change', newValue)
}, { deep: true })
</script>
