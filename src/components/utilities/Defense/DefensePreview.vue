<template>
  <div class="card h-100">
    <LoadingSpinner v-if="isLoading" />

    <div class="card-body">
      <div class="defense-info">
        <div class="defense-info__header d-flex align-items-center flex-column">
          <div class="defense-info__header-info mb-3 w-100 d-flex align-items-center">
            <div class="defense-info__header-icon__wrapper">
              <div class="defense-info__header-icon">
                <img :src="defenseData?.icon" :alt="defenseData?.name">
              </div>
            </div>

            <h4 class="text-center">
              {{ userData.label }}
            </h4>
          </div>
        </div>

        <slot name="defense-details">
          <div>
            <div class="defense-info__mods defense-utils mb-3">
              <h5 class="text-center">Mods</h5>
              <div class="defense-info__mods_mod-slot defense-utils__util bg-dark-subtle" v-for="(mod, index) in userMods" :key="index">
                <div class="defense-info__shards_shard-name defense-utils__util-name" v-if="mod?.name">{{ mod.name }}</div>
                <div class="defense-info__shards_shard-name w-100" v-else-if="editMode"><ModSelection @change="(mod) => {userData.relic.mods[index] = mod.id; loadMods()}" /></div>
                <div class="text-muted" v-else>Empty mod slot</div>
              </div>
            </div>

            <div class="defense-info__shards defense-utils">
              <h5 class="text-center">Shards</h5>
              <div class="defense-info__shards_shard defense-utils__util bg-dark-subtle d-flex align-items-center" v-for="(shard, index) in userShards" :key="index">
                <div class="defense-info__shards_shard-icon" v-if="shard?.icon"><img :src="shard?.icon" :alt="shard?.name"></div>
                <div class="defense-info__shards_shard-name defense-utils__util-name" v-if="shard?.name">{{ shard.name }}</div>
                <div class="defense-info__shards_shard-name w-100" v-else-if="editMode"><ShardSelection @change="(shard) => {userData.shards[index] = shard.id; loadShards()}" /></div>
                <div class="text-muted" v-else>Empty shard slot</div>
              </div>
            </div>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted } from "vue";
import type { PropType } from "vue";

import LoadingSpinner from "@/components/layout/LoadingSpinner.vue";

import { useDefenseStore } from "@/stores/DefenseInfo"
import { useModStore } from "@/stores/ModInfo"
import { useShardStore } from "@/stores/ShardInfo"
import type { DefenseRootInterface, UserDefenseInterface, ModInterface, ShardInterface } from "@/interaces";
import ModSelection from "@/components/utilities/Defense/Relic/ModSelection.vue";
import ShardSelection from "@/components/utilities/Defense/ShardSelection.vue";

const { getDefenseRoot } = useDefenseStore()
const { getModById } = useModStore()
const { getShardById } = useShardStore()

const props = defineProps({
  editMode: {
    type: Boolean,
    default: false,
  },
  defense: {
    type: Object as PropType<UserDefenseInterface>,
    required: true,
  },
});

type Nullable<T> = T | null

const userData: UserDefenseInterface = props.defense as UserDefenseInterface
const id = ref<string>()
const defenseData = ref<DefenseRootInterface|undefined>()
const userMods = ref<Nullable<ModInterface>[]>([])
const userShards = ref<Nullable<ShardInterface>[]>([])
const isLoading = ref<boolean>(true)

Promise.all([loadDefenseData(), loadMods(), loadShards()]).then((): void => {
  isLoading.value = false
})

async function loadDefenseData(): Promise<void> {
  defenseData.value = await getDefenseRoot(userData.id)

  return Promise.resolve()
}

async function loadMods(): Promise<void> {
  const resolvedUserMods = []
  for (const modId of userData.relic.mods) {
    resolvedUserMods.push(await getModById(modId))
  }

  for (let i = resolvedUserMods.length; i < 3; i++) {
    resolvedUserMods.push(null)
  }

  userMods.value = resolvedUserMods

  return Promise.resolve()
}

async function loadShards(): Promise<void> {
  const resolvedUserShards = []
  for (const shardId of userData.shards) {
    resolvedUserShards.push(await getShardById(shardId))
  }

  for (let i = resolvedUserShards.length; i < 3; i++) {
    resolvedUserShards.push(null)
  }

  userShards.value = resolvedUserShards

  return Promise.resolve()
}

onMounted((): void => {
  id.value = 'id' + Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
      .toLowerCase() + userData.incrementId
})
</script>

<style scoped>
.defense-info__header-icon__wrapper {
  width: 30%;
  max-width: 100px;
  margin-right: 15px;
}
.defense-info__header-icon img {
  width: 100%;
}

.defense-utils__util {
  width: 100%;
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin: 0.5rem 0;
}
.defense-utils__util-name {
  font-weight: bold;
}

.defense-info__shards_shard-icon img {
  width: 50px;
  margin-right: 10px;
}
</style>
