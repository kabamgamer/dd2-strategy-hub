<template>
  <div class="shards">
    <h5>Shards</h5>

    <div class="shards__slot bg-dark-subtle d-flex" v-for="(selection, index) in userSelection" :key="index">
      <div class="shards__slot-icon">
        <img :src="selection.shard.icon" v-if="selection.shard">
      </div>

      <div class="shards__slot-content" v-if="!selection.shard">
        <div class="shards__slot-name">Shard #{{ index+1 }}</div>
        <div class="shards__slot-description">
          <ShardSelection v-model="selection.shard" @change="onAddShard(index, selection.shard)" :defenseCompatibility="defenseCompatibility" />
        </div>
      </div>
      <div class="shards__slot-content" v-else>
        <div class="shards__slot-name d-flex justify-content-between">
          <span>{{ selection.shard.name }}</span>

          <Cross class="cross" @click="onDeleteShard(index)" />
        </div>
        <div class="shards__slot-description">{{ selection.shard.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue"
import type { ShardInterface } from "@/interaces"

import ShardSelection from "@/components/utilities/ShardSelection.vue"
import Cross from "@/components/icons/IconCross.vue"
import { ref } from "vue"

import { useShardStore } from "@/stores/ShardInfo"
const { getShardById, getAllShardsUncategorized } = useShardStore()

const props = defineProps({
  modelValue: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  defenseCompatibility: String,
});

const modelValue = props.modelValue ?? [];
const userSelection = ref<{shard: ShardInterface|undefined}[]>([
  {shard: undefined},
  {shard: undefined},
  {shard: undefined},
]);

getAllShardsUncategorized().then((): void => {
  modelValue.forEach(async (shardId: string, index: number): Promise<void> => {
    userSelection.value[index].shard = await getShardById(shardId);
  })
})

function onAddShard(index: number, shard: ShardInterface|undefined): void {
  if (!shard) return;
  props.modelValue.push(shard.id);
}

function onDeleteShard(index: number): void {
  userSelection.value.splice(index, 1);
  userSelection.value[2] = {shard: undefined}
  props.modelValue.splice(index, 1);
}
</script>

<style scoped>
.shards__slot {
  padding: 5px;
  margin: 10px 0;
  border: 1px solid rgba(var(--bs-black-rgb), .2);
  border-radius: 10px;
}

.shards__slot-icon {
  width: 80px;
  height: 80px;
  border: 1px solid rgba(var(--bs-black-rgb), .2);
  border-radius: 3px;
}

.shards__slot-icon img {
  width: 100%;
  height: 100%;
}

.shards__slot-content {
  padding: 5px 0 5px 5px;
  width: calc(100% - 80px);
}

.shards__slot-content .shards__slot-name {
  font-weight: bold;
}

.cross {
  cursor: pointer;
}
</style>