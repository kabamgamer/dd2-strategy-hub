<template>
  <SearchableSelect v-model="selectedDefense" :options="allDefenses" grouped label-attr="name" />
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { defineProps, defineEmits, watch, ref } from 'vue'
import type { DefenseRootInterface } from '@/interaces'

import SearchableSelect from "@/components/layout/form/SearchableSelect.vue";

import { useDefenseStore } from "@/stores/DefenseInfo";
const { getAllDefensesCategorizedByHero } = useDefenseStore();

const props = defineProps({
  modelValue: Object as PropType<DefenseRootInterface|null>,
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectedDefense = ref<DefenseRootInterface | null>(null)
const allDefenses = ref<{[hero: string]: DefenseRootInterface[]}>()

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
