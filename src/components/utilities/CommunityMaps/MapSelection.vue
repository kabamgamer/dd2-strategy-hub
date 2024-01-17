<template>
  <SearchableSelect v-model="selectedMap" :options="availableMaps" grouped label-attr="name" />
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import { ref, watch } from "vue";

import SearchableSelect from "@/components/layout/form/SearchableSelect.vue";

import { useMapStore } from "@/stores/Map";
import type MapData from "@/data/MapData";
const { getAllMapsCategorizedByRegion } = useMapStore();

const emit = defineEmits(['update:modelValue', 'change']);

const props = defineProps({
  modelValue: {
    type: Object as PropType<MapData>,
    default: () => ({}),
  },
});

const selectedMap = ref();
const availableMaps = ref<{[region: string]: MapData[]}>({});

getAllMapsCategorizedByRegion().then((maps: {[region: string]: MapData[]}): void => {
  availableMaps.value = maps;
})

watch(() => props.modelValue, (newValue: any): void => {
  selectedMap.value = newValue;
});

watch(selectedMap, (newValue: any): void => {
  emit('update:modelValue', newValue);
  emit('change', newValue);
}, { deep: true });

</script>

<style scoped>

</style>