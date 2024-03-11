<template>
  <div class="accordion-item position-relative mb-3">
    <LoadingSpinner v-if="loading" />

    <h2 class="accordion-header defense-header" :id="id + '-heading'">
      <button class="accordion-button" type="button" :class="{ collapsed }" data-bs-toggle="collapse" :data-bs-target="'#' + id" :aria-expanded="!collapsed" :aria-controls="id">
        <span class="d-flex justify-content-between w-100">
          <span class="defense-label">{{ defense.userData?.label }}</span>

          <span class="defense-dps" v-if="defense.defenseData?.baseDefensePower && !isBuffDefense()">{{ Math.round(totalDps).toLocaleString('en-US') }}</span>
        </span>
      </button>
    </h2>

    <div :id="id" ref="accordionCollapse" class="accordion-collapse collapse" :class="{ show: !collapsed }" :aria-labelledby="id + '-heading'">
      <div class="accordion-body">

        <DefenseSelection v-if="!defense.userData?.label" @change="onDefenseSelection" />

        <div class="defense-info" v-else>
          <div class="actions d-flex justify-content-between mb-2" v-if="!setupDefenses">
            <div class="defense-info__header-label" v-if="!setupDefenses">
              <input type="text" class="form-control" v-model="defense.userData.label" />
            </div>

            <button class="btn btn-danger" @click.prevent="deleteDefense(defense.userData.incrementId)">
              Delete
            </button>
          </div>

          <div class="defense-info__header d-flex align-items-center flex-column">
            <div class="defense-info__header-info mb-3 w-100 d-flex">
              <div class="defense-info__header-icon__wrapper">
                <div class="defense-info__header-icon">
                  <img :src="defense.defenseData?.icon" :alt="defense.defenseData?.name">
                </div>
              </div>
              <div class="defense-info__header-stats w-100" v-if="!isBuffDefense()">
                <span class="w-100 defense-info__header-stats__stat d-flex align-items-center">
                  <strong>Tier:</strong>
                  <div class="defense-info__level d-flex">
                    <button class="btn btn-link" @click="defenseLevel--" :disabled="defenseLevel===1"><IconChevronDown /></button>
                    <span class="defense-info__level-value">{{ defenseLevel }}</span>
                    <button class="btn btn-link" @click="defenseLevel++" :disabled="defenseLevel===5"><IconChevronUp /></button>
                  </div>

                  <span class="badge rounded-pill bg-success du-badge">{{ defense.defenseData?.defenseUnits }} DU</span>
                </span>
                <span class="w-100 defense-info__header-stats__stat"><strong>Tooltip DPS:</strong> {{ Math.round(tooltipDps).toLocaleString('en-US') }}</span>
                <span v-if="isDev" class="w-100 defense-info__header-stats__stat"><strong>Attack damage:</strong> {{ Math.round(attackDamage).toLocaleString('en-US') }}</span>
                <span class="w-100 defense-info__header-stats__stat"><strong>Defense HP:</strong> {{ Math.round(defenseHitPoints).toLocaleString('en-US') }}</span>
                <span class="w-100 defense-info__header-stats__stat"><strong>Defense Rate:</strong> {{ attackRate }} ({{ attackRatePercentage }}%)</span>
                <span class="w-100 defense-info__header-stats__stat"><strong>Defense Range:</strong> {{ defenseRange }}</span>
                <span class="w-100 defense-info__header-stats__stat"><strong>Crit chance:</strong> {{ (criticalChance * 100).toFixed(2) }}%</span>
                <span class="w-100 defense-info__header-stats__stat"><strong>Crit damage:</strong> {{ (criticalDamage * 100).toFixed(2) }}%</span>

                <div v-for="(stat, index) in defenseSpecificStats" :key="index">
                  <DefenseSpecificStat :stat="stat" />
                </div>
              </div>
              <div class="defense-info__header-stats w-100" v-else>
                <span class="w-100 defense-info__header-stats__stat d-flex align-items-center">
                  <strong>Tier:</strong>
                  <div class="defense-info__level d-flex">
                    <button class="btn btn-link" @click="defenseLevel--" :disabled="defenseLevel===1"><IconChevronDown /></button>
                    <span class="defense-info__level-value">{{ defenseLevel }}</span>
                    <button class="btn btn-link" @click="defenseLevel++" :disabled="defenseLevel===5"><IconChevronUp /></button>
                  </div>

                  <span class="badge rounded-pill bg-success du-badge">{{ defense.defenseData?.defenseUnits }} DU</span>
                </span>
                <span class="w-100 defense-info__header-stats__stat"><strong>Defense Power bonus:</strong> {{ Math.round(defensePower / 10) }}</span>
                <span class="w-100 defense-info__header-stats__stat"><strong>Crit damage bonus:</strong> {{ (criticalDamage * 100 / 4).toFixed(2) }}%</span>
                <span class="w-100 defense-info__header-stats__stat"><strong>Defense Range:</strong> {{ defenseRange }}</span>
              </div>
            </div>
          </div>

          <slot name="defense-details">
            <div class="accordion-header">
              <button class="accordion-button user-details-collapse p-0" :class="{ collapsed: defense.userData.isUserDataCollapsed }" type="button" data-bs-toggle="collapse" :data-bs-target="'#userDetails' + id">
                User details
              </button>
            </div>

            <div :id="'userDetails' + id" class="collapse" :class="{ show: !defense.userData.isUserDataCollapsed }">
              <hr />

              <div class="defense-info__actions">
                <a class="defense-info__actions-action" @click.prevent="maxAllStats('medallion')">Max stats (medallion)</a>
                <a class="defense-info__actions-action" @click.prevent="maxAllStats('totem')">Max stats (totem)</a>
              </div>

              <div class="defense-info__pet">
                <div class="row">
                  <div class="col-md-6">
                    <DefenseRelic v-model="defense.userData.relic" :defenseCompatibility="defense.userData.id" :hide-mods="true" />
                  </div>
                  <div class="col-md-6">
                    <Pet v-model="defense.userData.pet" />
                  </div>
                </div>
              </div>

              <hr />

              <div class="defense-info__relic">
                <DefenseRelic v-model="defense.userData.relic" :defenseCompatibility="defense.userData.id" :hide-relic="true" />

                <i v-if="hasDiverseMods">For proper testing diverse mods, use defense setups (see section below)</i>
              </div>

              <hr />

              <div class="defense-info__shards">
                <Shards v-model="defense.userData.shards" :defenseCompatibility="defense.userData.id" />
              </div>

              <hr />

              <div class="defense-info__shards">
                <AscensionPoints v-model="defense.userData.ascensionPoints" :ascensionPoints="defense.defenseData?.ascensionPoints" />
              </div>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onMounted, computed } from "vue";
import type { PropType } from "vue";
import type {
  DefenseRootInterface,
  UserDefenseInterface,
  CalculatedDefenseStatsInterface,
  DefenseSetupModifiersInterface,
  UserSetupDefenseInterface
} from "@/interaces";

import DefenseSelection from "@/components/utilities/Defense/DefenseSelection.vue";
import Pet from "@/components/utilities/Defense/Pet.vue";
import DefenseRelic from "@/components/utilities/Defense/Relic/DefenseRelic.vue";
import Shards from "@/components/utilities/Defense/Shards.vue";
import AscensionPoints from "@/components/utilities/AscensionPoints.vue";
import IconChevronUp from "@/components/icons/IconChevronUp.vue";
import IconChevronDown from "@/components/icons/IconChevronDown.vue";
import LoadingSpinner from "@/components/layout/LoadingSpinner.vue";

import PetData from "@/classes/Pet";
import RelicData from "@/classes/Relic";

import type DefenseModData from "@/data/DefenseModData";
import type DefenseShardData from "@/data/DefenseShardData";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";

import { useDebounce } from "@/composables/Debounce";
import { useDefenseCalculations } from "@/composables/DefenseCalculations";
import { useGodlyStat } from "@/composables/GodlyStat"
import { useGoogleSpreadsheetDataStore } from "@/stores/GoogleSpreadSheets";
import { useModStore } from "@/stores/ModInfo"
import { useShardStore } from "@/stores/ShardInfo"
import { useUserDataStore } from "@/stores/UserData";
import { storeToRefs } from "pinia";
import ModType from "@/enums/ModType";
import DefenseSpecificStat from "@/components/utilities/Defense/DefenseSpecificStat.vue";

const userStore = useUserDataStore();
const googleSpreadsheetDataStore = useGoogleSpreadsheetDataStore()
const { getMaxStatForGodlyType } = useGodlyStat()

const { debounce } = useDebounce()
const { loading } = storeToRefs(googleSpreadsheetDataStore)
const { deleteDefense } = userStore
const { ancientPowerPoints, isDev } = storeToRefs(userStore);
const { totalDps, tooltipDps, attackDamage, attackRate, defensePower, defenseHitPoints, defenseRange, criticalDamage, criticalChance, calculateDefensePower, defenseSpecificStats, isBuffDefense } = useDefenseCalculations()
const { getModById } = useModStore()
const { getShardById } = useShardStore()

const emit = defineEmits(['total-dps-calculated'])
const props = defineProps({
  defense: {
    type: Object as PropType<UserDataStoreDefenseInterface>,
    required: true,
  },
  collapsed: Boolean,
  setupDefenses: Object as PropType<UserDataStoreDefenseInterface[]|undefined>,
  setupDefenseOptions: Object as PropType<{ [defensesIncrementId: number]: UserSetupDefenseInterface }|undefined>,
  defenseBoosts: Object as PropType<{[incrementId: number]: CalculatedDefenseStatsInterface}|undefined>,
  setupModifiers: Object as PropType<DefenseSetupModifiersInterface|undefined>,
});

const defense: UserDataStoreDefenseInterface = props.defense as UserDataStoreDefenseInterface

let defenseBoosts: {[incrementId: number]: CalculatedDefenseStatsInterface}|undefined;

const id = ref<string>()
const accordionCollapse = ref()
const defenseLevel = ref<number>(1)
const hasDiverseMods = ref<boolean>(false)
const userDefenseMods = ref<DefenseModData[]>([])
const userDefenseShards = ref<DefenseShardData[]>([])
const userSetupDefensesShards = ref<{ [defenseIncrementId: number]: DefenseShardData[] }>({})
const isLoadingDefenseSetupShards = ref<boolean>(false)
const attackRatePercentage = computed(() => Math.round((attackRate.value - (defense.defenseData?.baseAttackRate ?? 0)) / ((defense.defenseData?.maxAttackRate ?? 0) - (defense.defenseData?.baseAttackRate ?? 0)) * 100))

function recalculate(): void {
  if (!defense.userData) return

  userDefenseMods.value = []
  userDefenseShards.value = []

  defense.userData.relic.mods.forEach(async (modId: string): Promise<void> => {
    userDefenseMods.value.push(await getModById(modId))
  })
  defense.userData.shards.forEach(async (shardId: string): Promise<void> => {
    userDefenseShards.value.push(await getShardById(shardId))
  })

  // Await the loading of mods and shards before calculating
  const interval: any = setInterval((): void => {
    if (
        userDefenseMods.value.length === defense.userData.relic.mods.length
        && userDefenseShards.value.length === defense.userData.shards.length
        && (!props.setupDefenses || !isLoadingDefenseSetupShards.value)
    ) {
      clearInterval(interval)
      calculateDefensePower(defense.defenseData, defense.userData, userDefenseMods.value, userDefenseShards.value, defenseLevel.value, ancientPowerPoints.value, props.setupDefenses, userSetupDefensesShards.value, props.setupDefenseOptions, props.defenseBoosts, props.setupModifiers)
      emit('total-dps-calculated', totalDps.value, defensePower.value, defenseHitPoints.value, criticalDamage.value, criticalChance.value, userDefenseShards.value, props.defenseBoosts ? Object.keys(props.defenseBoosts) : [])
    }
  }, 100)
}

async function loadSetupShards(): Promise<void> {
  if (!props.setupDefenses) return

  isLoadingDefenseSetupShards.value = true
  userSetupDefensesShards.value = {}
  for (const setupDefense of props.setupDefenses) {
    userSetupDefensesShards.value[setupDefense.incrementId] = [];
    for (const shardId of setupDefense.userData.shards) {
      userSetupDefensesShards.value[setupDefense.incrementId].push(await getShardById(shardId))
    }
  }

  isLoadingDefenseSetupShards.value = false
}

let unwatchUserData = watch(defense.userData, recalculate, { deep: true })

function onDefenseSelection(defenseData: DefenseRootInterface): void {
  defense.defenseData = defenseData
  defense.userData = {
    incrementId: defense.incrementId,
    id: defenseData.id,
    isCollapsed: false,
    isUserDataCollapsed: false,
    label: defenseData.name,
    pet: new PetData,
    relic: new RelicData,
    shards: [],
    ascensionPoints: {},
  } as UserDefenseInterface;

  unwatchUserData()
  unwatchUserData = watch(() => defense.userData, recalculate, { deep: true })
}

function maxAllStats(type: string): void {
  let isMedallion = true
  if (type === 'totem') {
    isMedallion = false
  }

  defense.userData.pet = {
    defensePower: 18000,
    defenseHealth: 18000,
  }
  defense.userData.relic = {
    defensePower: isMedallion ? 110513 : 46419,
    defenseHealth: isMedallion ? 30946 : 73676,
    godlyStat: !defense.userData.relic.godlyStat ? undefined : {
      type: defense.userData.relic.godlyStat.type,
      value: getMaxStatForGodlyType(defense.userData.relic.godlyStat.type),
    },
    mods: defense.userData.relic.mods,
  }
}

watch(userDefenseMods, debounce(() => {
hasDiverseMods.value = userDefenseMods.value.filter((mod: any) => (mod as DefenseModData).type?.id === ModType.Diverse.id).length > 0
}, 200), { deep: true })

// Trigger recalculation on data changes
watch(defenseLevel, recalculate)
watch(ancientPowerPoints, recalculate, { deep: true })
watch(() => props.setupModifiers, recalculate, { deep: true })
watch(() => props.setupDefenseOptions, recalculate, { deep: true })
watch(() => props.defenseBoosts, (newValue) => {
  if (JSON.stringify(newValue) === JSON.stringify(defenseBoosts)) return

  // Clone the defenseBoosts object to avoid reactivity issues
  defenseBoosts = JSON.parse(JSON.stringify(newValue))

  setTimeout(recalculate, 400)
}, { deep: true })
watch(() => props.setupDefenses, (newValue, oldValue) => {
  if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return

  loadSetupShards()

  setTimeout(recalculate, 400)
}, { deep: true })

onMounted((): void => {
  id.value = 'id' + Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
      .toLowerCase() + defense.incrementId

  accordionCollapse.value.addEventListener('hidden.bs.collapse', function (event: Event) {
    if (props.setupDefenses) return

    if ((event.target as HTMLElement).id !== id.value) {
      defense.userData.isUserDataCollapsed = true
      return
    }

    defense.userData.isCollapsed = true
  })
  accordionCollapse.value.addEventListener('shown.bs.collapse', function (event: Event) {
    if (props.setupDefenses) return

    if ((event.target as HTMLElement).id !== id.value) {
      defense.userData.isUserDataCollapsed = false
      return
    }

    defense.userData.isCollapsed = false
  })

  loadSetupShards()

  // Await the loading of defenseData before initializing calculations
  const interval: any = setInterval((): void => {
    if (defense.defenseData) {
      clearInterval(interval)
      recalculate()

      setTimeout(recalculate, 400)
    }
  }, 100)
})
</script>

<style lang="scss" scoped>
.defense-info {
  &__header {
    &-icon {
      border: 1px solid grey;

      &__wrapper {
        width: 60%;
        max-width: 150px;
      }

      img {
        width: 100%;
      }
    }

    &-stats {
      margin-left: 5px;
      font-size: larger;
      display: flex;
      flex-direction: column;
    }
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    &-action {
      cursor: pointer;
      font-size: 14px;
    }
  }

  &__level {
    .btn {
      padding: 0 3px;
      margin: 0;

      svg {
        color: var(--bs-accordion-color);
        width: 15px;
      }
    }
  }
}

.du-badge {
  margin-left: auto
}

.defense-dps {
  margin-right: 5px
}

.defense-header {
  position: sticky;
  top: 54px; /* height of navbar */
  z-index: 100;
}
.accordion-button {
  font-weight: bold;
}
.accordion-button:focus {
  box-shadow: none;
}

.accordion-button.user-details-collapse {
  background: transparent;
  color: var(--bs-body-color);
  box-shadow: none;
}
</style>

<style>
.defense-info__header-stats__stat {
  font-size: 12pt;
}
</style>