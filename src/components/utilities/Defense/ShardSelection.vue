<template>
  <SearchableSelect v-model="selectedShard" :options="compatibleShards" grouped label-attr="name" />
</template>

<script setup lang="ts">
import type { ShardInterface } from "@/interaces";

import type { PropType } from "vue";
import { ref, watch, computed } from "vue";

import SearchableSelect from "@/components/layout/form/SearchableSelect.vue";

import { useShardStore } from "@/stores/ShardInfo";
const { getAllShardsCategorizedByTier } = useShardStore();

const emit = defineEmits(['update:modelValue', 'change']);

const props = defineProps({
  modelValue: {
    type: Object as PropType<ShardInterface>,
    default: () => ({}),
  },
  defenseCompatibility: {
    type: String,
    default: '',
  },
});

const selectedShard = ref('');
const availableShards = ref<{[tier: string]: ShardInterface[]}>({});
const compatibleShards = computed((): {[tier: string]: ShardInterface[]} => {
  if (props.defenseCompatibility === '') return availableShards.value;

  const filteredShards: {[tier: string]: ShardInterface[]} = {};
  for (const tier in availableShards.value) {
    filteredShards[tier] = availableShards.value[tier].filter((shard: ShardInterface): boolean => {
      if (shard.compatibilities === undefined) return true;

      return shard.compatibilities.includes(props.defenseCompatibility);
    });

    if (filteredShards[tier].length === 0) delete filteredShards[tier];
  }

  return filteredShards;
});

getAllShardsCategorizedByTier().then((shards: {[tier: string]: ShardInterface[]}): void => {
  availableShards.value = shards;
})

watch(props.modelValue, (newValue: any): void => {
  selectedShard.value = newValue.name;
}, { deep: true });

watch(selectedShard, (newValue: any): void => {
  emit('update:modelValue', newValue);
  emit('change', newValue);
}, { deep: true });

</script>

<style scoped>

</style>