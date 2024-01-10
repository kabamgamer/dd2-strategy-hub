<template>
  <SearchableSelect v-model="selectedDefense" :clear-on-select="clearOnSelect" :options="options" :tabbed="Array.isArray(tabs)" grouped label-attr="name" />
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch, ref, computed } from 'vue'
import type { PropType } from 'vue'
import type { DefenseRootInterface } from '@/interaces'

import SearchableSelect from "@/components/layout/form/SearchableSelect.vue";

import { useDefenseStore } from "@/stores/DefenseInfo";
const { getAllDefensesCategorizedByHero } = useDefenseStore();

const props = defineProps({
  modelValue: Object as PropType<DefenseRootInterface|null>,
  clearOnSelect: Boolean,
  tabs: Array,
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectedDefense = ref<DefenseRootInterface | null>(null)
const allDefenses = ref<{[hero: string]: DefenseRootInterface[]}>()

const options = computed((): any => {
  if (!Array.isArray(props.tabs)) return allDefenses.value

  const tabs: any = props.tabs.filter((tab: any): boolean => {
    return tab.label !== 'New defense'
  })

  if (!allDefenses.value) {
    return tabs
  }

  tabs.push({
    label: 'New defense',
    options: allDefenses.value,
  });

  return tabs;
})

getAllDefensesCategorizedByHero().then((defenses: {[hero: string]: DefenseRootInterface[]}): void => {
  allDefenses.value = defenses
})

watch(() => props.modelValue as any, (newValue: any): void => {
  if (!newValue) return
  selectedDefense.value = newValue
}, { deep: true })

watch(selectedDefense, (newValue: DefenseRootInterface | null): void => {
  if (newValue === null) return

  emit('update:modelValue', newValue)
  emit('change', newValue)
}, { deep: true })
</script>
