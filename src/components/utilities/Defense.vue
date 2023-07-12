<template>
  <div class="accordion-item position-relative mb-3">
    <LoadingSpinner v-if="loading" />

    <h2 class="accordion-header" :id="id + '-heading'">
      <button class="accordion-button" type="button" data-bs-toggle="collapse" :data-bs-target="'#' + id" aria-expanded="true" :aria-controls="id">
        <span class="d-flex justify-content-between w-100">
          <span class="defense-label">{{ defense.userData?.label }}</span>

          <span class="defense-dps" v-if="defense.defenseData?.baseDefensePower && !isBuffDefense">{{ totalDps }}</span>
        </span>
      </button>
    </h2>

    <div :id="id" class="accordion-collapse collapse show" :aria-labelledby="id + '-heading'">
      <div class="accordion-body">
        <DefenseSelection v-if="!defense.userData?.label" @change="onDefenseSelection" />

        <div class="defense-info" v-else>
          <div class="defense-info__header d-flex align-items-center flex-column">
            <div class="defense-info__header-info mb-3 w-100 d-flex">
              <div class="defense-info__header-icon">
                <img :src="defense.defenseData?.icon" :alt="defense.defenseData?.name">
              </div>
              <div class="defense-info__header-stats w-100">
                <span class="w-100 defense-info__header-stats__stat d-flex align-items-center">
                  <strong>Tier:</strong>
                  <div class="defense-info__level d-flex">
                    <button class="btn btn-link" @click="defenseLevel--" :disabled="defenseLevel===1"><IconChevronDown /></button>
                    <span class="defense-info__level-value">{{ defenseLevel }}</span>
                    <button class="btn btn-link" @click="defenseLevel++" :disabled="defenseLevel===5"><IconChevronUp /></button>
                  </div>
                </span>
                <span class="w-100 defense-info__header-stats__stat"><strong>Defense Power:</strong> {{ Math.round(defensePower) }}</span>
                <span class="w-100 defense-info__header-stats__stat"><strong>Defense Health:</strong> {{ Math.round(defenseHealth) }}</span>
                <span v-if="!isBuffDefense" class="w-100 defense-info__header-stats__stat"><strong>Crit chance:</strong> {{ Math.round(criticalChance * 100) }}%</span>
                <span class="w-100 defense-info__header-stats__stat"><strong>Crit damage:</strong> {{ Math.round(criticalDamage * 100) }}%</span>
              </div>
            </div>

            <div class="defense-info__header-label" v-if="!setupDefenses">
              <input type="text" v-model="defense.userData.label" />
            </div>
          </div>

          <slot name="defense-details">
            <hr />

            <div class="defense-info__pet">
              <div class="row">
                <div class="col-md-6">
                  <Pet v-model="defense.userData.pet" />
                </div>
                <div class="col-md-6">
                  <DefenseRelic v-model="defense.userData.relic" :defenseCompatibility="defense.defenseData?.id" :hide-mods="true" />
                </div>
              </div>
            </div>

            <hr />

            <div class="defense-info__relic">
              <DefenseRelic v-model="defense.userData.relic" :defenseCompatibility="defense.defenseData?.id" :hide-relic="true" />

              <!-- Show input for "custom diverse stack" if defense has diverse mods -->
              <div v-if="hasDiverseMods">
                <CustomInput type="number" label="Custom diverse stack" v-model="defense.userData.diverseStack" />
              </div>
            </div>

            <hr />

            <div class="defense-info__shards">
              <Shards v-model="defense.userData.shards" :defenseCompatibility="defense.defenseData?.id" />
            </div>

            <hr />

            <div class="defense-info__shards">
              <AscensionPoints v-model="defense.userData.ascensionPoints" :ascensionPoints="defense.defenseData?.ascensionPoints" />
            </div>
          </slot>

          <div class="actions d-flex justify-content-center" v-if="!setupDefenses">
            <button class="btn btn-danger" @click.prevent="deleteDefense(defense.userData.incrementId)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, onMounted, computed } from "vue";
import type { PropType } from "vue";
import type { DefenseRootInterface, UserDefenseInterface } from "@/interaces";

import CustomInput from "@/components/layout/form/Input.vue";
import DefenseSelection from "@/components/utilities/DefenseSelection.vue";
import Pet from "@/components/utilities/Pet.vue";
import DefenseRelic from "@/components/utilities/DefenseRelic.vue";
import Shards from "@/components/utilities/Shards.vue";
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
import { useGoogleSpreadsheetDataStore } from "@/stores/GoogleSpreadSheets";
import { useModStore } from "@/stores/ModInfo"
import { useShardStore } from "@/stores/ShardInfo"
import { useUserDataStore } from "@/stores/UserData";
import { storeToRefs } from "pinia";
import ModType from "@/enums/ModType";

const userStore = useUserDataStore();
const googleSpreadsheetDataStore = useGoogleSpreadsheetDataStore()

const { debounce } = useDebounce()
const { loading } = storeToRefs(googleSpreadsheetDataStore)
const { deleteDefense } = userStore
const { ancientPowerPoints } = storeToRefs(userStore);
const { totalDps, defensePower, defenseHealth, criticalDamage, criticalChance, calculateDefensePower } = useDefenseCalculations()
const { getModById } = useModStore()
const { getShardById } = useShardStore()

const props = defineProps({
  defense: {
    type: Object as PropType<UserDataStoreDefenseInterface>,
    required: true,
  },
  setupDefenses: Object as PropType<UserDataStoreDefenseInterface[]|undefined>,
});

let defense: UserDataStoreDefenseInterface = props.defense as UserDataStoreDefenseInterface

const id = ref<string>()
const defenseLevel = ref<number>(1)
const hasDiverseMods = ref<boolean>(false)
const userDefenseMods = ref<DefenseModData[]>([])
const userDefenseShards = ref<DefenseShardData[]>([])
const isBuffDefense = computed((): boolean => defense.userData?.id === 'BoostAura' || defense.userData?.id === 'BuffBeam')

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
    if (userDefenseMods.value.length === defense.userData.relic.mods.length && userDefenseShards.value.length === defense.userData.shards.length) {
      clearInterval(interval)
      calculateDefensePower(defense.defenseData, defense.userData, userDefenseMods.value, userDefenseShards.value, defenseLevel.value, ancientPowerPoints.value, props.setupDefenses)
    }
  }, 100)
}

function onDefenseSelection(defenseData: DefenseRootInterface): void {
  defense.defenseData = defenseData
  defense.userData = {
    incrementId: defense.incrementId,
    id: defenseData.id,
    label: defenseData.name,
    pet: new PetData,
    relic: new RelicData,
    shards: [],
    ascensionPoints: {},
  } as UserDefenseInterface;
}

watch(userDefenseMods, debounce(() => {
hasDiverseMods.value = userDefenseMods.value.filter((mod: any) => (mod as DefenseModData).type?.id === ModType.Diverse.id).length > 0
}, 100), { deep: true })

// Trigger recalculation on data changes
watch(defenseLevel, recalculate)
watch(defense, recalculate, { deep: true })
watch(ancientPowerPoints, recalculate, { deep: true })
watch(props, recalculate, { deep: true })

onMounted((): void => {
  id.value = 'id' + Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
      .toLowerCase();

  recalculate()
})
</script>

<style scoped>
.defense-info__header-icon {
  width: 60%;
  max-width: 150px;
  border: 1px solid grey;
}

.defense-info__header-icon img {
  width: 100%;
}

.defense-info__header-stats {
  margin-left: 5px;
  font-size: larger;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.defense-info__header-stats__stat {
  font-size: 12pt;
}

.defense-dps {
  margin-right: 5px
}
.defense-info__level .btn {
  padding: 0 3px;
  margin: 0;
}
.defense-info__level .btn svg {
  color: var(--bs-primary);
  width: 15px;
}

.accordion-header {
  position: sticky;
  top: 0;
  z-index: 100;
}
.accordion-button {
  font-weight: bold;
}
.accordion-button:focus {
  box-shadow: none;
}
</style>
