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
            <div class="defense-info__godly-stat text-center">
              <span v-if="!editMode">{{ getGodlyStatLabelByType(godlyStatType) }}</span>
              <GodlyStatSelection v-else v-model="godlyStatType" hide-label />
            </div>

            <div class="defense-info__mods defense-utils mb-3">
              <h5 class="text-center">Mods</h5>
              <div class="defense-info__mods_mod-slot defense-utils__util bg-dark-subtle" v-for="(mod, index) in userMods" :key="index">
                <div class="defense-info__shards_shard-name defense-utils__util-name d-flex justify-content-between" v-if="mod?.name">
                  <span>{{ mod.name }}</span>

                  <Cross class="cross" v-if="editMode" @click="onDeleteMod(index)" />
                </div>
                <div class="defense-info__shards_shard-name w-100" v-else-if="editMode">
                  <ModSelection @change="(mod) => {userData.relic.mods[index] = mod.id; loadMods()}"
                                :defense-compatibility="defense.id"
                  />
                </div>
                <div class="text-muted" v-else>Empty mod slot</div>
              </div>
            </div>

            <div class="defense-info__shards defense-utils">
              <h5 class="text-center">Shards</h5>
              <div class="defense-info__shards_shard defense-utils__util bg-dark-subtle d-flex align-items-center" v-for="(shard, index) in userShards" :key="index">
                <div class="defense-info__shards_shard-icon" v-if="shard?.icon"><img :src="shard?.icon" :alt="shard?.name"></div>
                <div class="defense-info__shards_shard-name defense-utils__util-name d-flex justify-content-between" v-if="shard?.name">
                  <span>{{ shard.name }}</span>

                  <Cross class="cross" v-if="editMode" @click="onDeleteShard(index)" />
                </div>
                <div class="defense-info__shards_shard-name w-100" v-else-if="editMode">
                  <ShardSelection @change="(shard) => {userData.shards[index] = shard.id; loadShards()}"
                                  :defense-compatibility="defense.id"
                  />
                </div>
                <div class="text-muted" v-else>Empty shard slot</div>
              </div>
            </div>
          </div>

          <button v-if="editMode"
                  class="btn btn-danger w-100"
                  @click.prevent="$emit('delete')">
            Delete
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, onMounted } from "vue";
import type { PropType } from "vue";

import LoadingSpinner from "@/components/layout/LoadingSpinner.vue";

import { useDefenseStore } from "@/stores/DefenseInfo"
import { useModStore } from "@/stores/ModInfo"
import { useShardStore } from "@/stores/ShardInfo"
import { useGodlyStat } from "@/composables/GodlyStat"
import type {
  DefenseRootInterface,
  UserDefenseInterface,
  ModInterface,
  ShardInterface,
  MapDefenseInterface
} from "@/types";
import ModSelection from "@/components/utilities/Defense/Relic/ModSelection.vue";
import ShardSelection from "@/components/utilities/Defense/ShardSelection.vue";
import GodlyStatSelection from "@/components/utilities/Defense/Relic/GodlyStatSelection.vue";
import Cross from "@/components/icons/IconCross.vue";

const { getDefenseRoot } = useDefenseStore()
const { getModById } = useModStore()
const { getShardById } = useShardStore()
const { getGodlyStatLabelByType } = useGodlyStat()

const props = defineProps({
  editMode: {
    type: Boolean,
    default: false,
  },
  defense: {
    type: Object as PropType<UserDefenseInterface | MapDefenseInterface>,
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
const godlyStatType = computed<string>({
  get: (): string => userData.relic.godlyStat?.type ?? 'none',
  set: (value: string): void => {
    if (value === 'none') {
      userData.relic.godlyStat = undefined
      return
    }

    userData.relic.godlyStat = {
      type: value,
      value: 0,
    }
  }
})

Promise.all([loadDefenseData(), loadMods(), loadShards()]).then((): void => {
  isLoading.value = false
})

function onDeleteMod(index: number): void {
  userData.relic.mods.splice(index, 1)
  loadMods()
  userData.shards
}

function onDeleteShard(index: number): void {
  userData.shards.splice(index, 1)
  loadShards()
}

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

<style lang="scss" scoped>
.defense-info {
  &__header-icon {
    &__wrapper {
      width: 30%;
      max-width: 100px;
      margin-right: 15px;
    }

    img {
      width: 100%;
    }
  }

  &__godly-stat {
    color: #0dcaf0;
    font-weight: bold;
    font-size: 1.2rem;
    margin-top: 5px;
    margin-bottom: 15px;
  }

  &__shards {
    &_shard-icon img {
      width: 50px;
      margin-right: 10px;
    }
  }
}

.defense-utils__util {
  width: 100%;
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin: 0.5rem 0;
}
.defense-utils__util-name {
  font-weight: bold;
  width: 100%;
}
</style>
