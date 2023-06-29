<template>
  <select class="form-select" v-model="selectedDefense">
    <option selected>Select a defense</option>

    <optgroup :label="hero.toString()" v-for="(heroDefenses, hero) in allDefenses" :key="hero">
      <option :value="defense" v-for="defense in heroDefenses" :key="defense.id">{{ defense.name }}</option>
    </optgroup>
  </select>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { defineProps, defineEmits, watch, ref } from 'vue'
import type { DefenseRootInterface } from '@/interaces'

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

watch(props.modelValue as any, (newValue: any): void => {
  if (!newValue) return
  selectedDefense.value = newValue
}, { deep: true })

watch(selectedDefense, (newValue: DefenseRootInterface | null): void => {
  if (newValue === null) return

  emit('update:modelValue', newValue)
  emit('change', newValue)
}, { deep: true })
</script>
