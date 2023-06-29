<template>
  <select class="form-select" v-model="selectedShard">

    <optgroup :label="tier.toString()" v-for="(tierShards, tier) in availableShards" :key="tier">
      <option :value="shard" v-for="(shard, index) in tierShards" :key="index">{{ shard.name }}</option>
    </optgroup>
  </select>
</template>

<script setup lang="ts">
import type { ShardInterface } from "@/interaces";

import type { PropType } from "vue";
import type { DefenseRootInterface } from "@/interaces";
import { ref, watch } from "vue";

import { useShardStore } from "@/stores/ShardInfo";
const { getAllShardsCategorizedByTier } = useShardStore();

const emit = defineEmits(['update:modelValue', 'change']);

const props = defineProps({
  modelValue: {
    type: Object as PropType<ShardInterface>,
    default: () => ({}),
  },
  defenseCompatibility: Object as PropType<DefenseRootInterface>,
});

const selectedShard = ref('');
const availableShards = ref<{[tier: string]: ShardInterface[]}>({});

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