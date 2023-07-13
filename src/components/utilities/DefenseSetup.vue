<template>
  <div class="setup">
    <div class="setup__toolbar d-flex justify-content-between mb-2">
      <div class="setup__toolbar_left">
        <h3>{{ defenseSetup.label }} <span v-if="defenses.length === 0">(Configure a defense first)</span></h3>
      </div>

      <div class="setup__toolbar_right d-flex">
        <div class="setup__toolbar_total-dps">
          Total setup DPS: {{ Math.round(totalDps).toLocaleString('en-US') }}
        </div>

        <div class="setup__toolbar_actions">
          <button class="btn btn-danger delete-btn" @click.prevent="deleteDefenseSetup(defenseSetup.incrementId)">
            Delete
          </button>
          <button class="btn btn-primary add-btn" :class="{ disabled: defenses.length === 0 }" :disabled="defenses.length === 0" @click.prevent="addDefense">
            Add defense
          </button>
        </div>
      </div>
    </div>

    <hr class="w-100" />

    <div class="row">
      <div class="col-md-4" v-for="defense in setupDefenses" :key="defense.incrementId">
        <Defense
            :defense="defense"
            :setupDefenses="setupDefenses"
            :defenseBoosts="defenseBoosts"
            @total-dps-calculated="(totalDps: number, defensePower: number, defenseHealth: number, criticalDamage: number, criticalChance: number) => {
              onDefenseDpsCalculated(defense, totalDps, defensePower, defenseHealth, criticalDamage, criticalChance)
            }"
        >
          <template #defense-details>
            <div class="d-flex justify-content-center">
              <button class="btn btn-danger" @click.prevent="deleteDefense(defense.incrementId)">
                Delete
              </button>
            </div>
          </template>
        </Defense>
      </div>

      <div class="col-md-4" v-if="defenseSelect">
        <div class="accordion-item position-relative mb-3">
          <h2 class="accordion-header" :id="id + '-heading'">
            <button class="accordion-button" type="button">
              <span class="d-flex justify-content-between w-100"></span>
            </button>
          </h2>

          <div class="accordion-collapse collapse show">
            <div class="accordion-body">
              <select class="form-select" @change="selectDefense" v-model="selectedDefense">
                <option :value="0" selected>
                  Select a defense
                </option>
                <option v-for="defense in defenseSelection" :key="defense.incrementId" :value="defense.incrementId">
                  {{ defense.userData.label }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, defineProps, computed } from "vue"
import type { PropType } from "vue"

import type { UserDataStoreDefenseInterface } from "@/stores/UserData"
import { useUserDataStore } from "@/stores/UserData"
import { storeToRefs } from "pinia"
import type { UserDefenseSetupInterface, CalculatedDefenseStatsInterface } from "@/interaces";
import Defense from "@/components/utilities/Defense.vue";

const props = defineProps({
  defenseSetup: {
    type: Object as PropType<UserDefenseSetupInterface>,
    required: true,
  },
})

const userStore = useUserDataStore()

const { defenses } = storeToRefs(userStore)
const { deleteDefenseSetup } = userStore

const id = ref<string>()
const defensesStats = ref<{[incrementId: number]: CalculatedDefenseStatsInterface}>({})
const defenseBoosts = ref<{[incrementId: number]: CalculatedDefenseStatsInterface}>({})
const defenseSelect = ref<boolean>(false)
const selectedDefense = ref<number|null>(null)

const setupDefenses = computed(() => defenses.value.filter((defense) => props.defenseSetup.defensesIncrementIds.includes(defense.incrementId)))
const defenseSelection = computed(() => defenses.value.filter((defense) => defense.userData && !props.defenseSetup.defensesIncrementIds.includes(defense.incrementId)))
const totalDps = computed((): number => Object.values(defensesStats.value).reduce((totalDps, defense: CalculatedDefenseStatsInterface) => totalDps + defense.totalDps, 0))

function onDefenseDpsCalculated(defense: UserDataStoreDefenseInterface, totalDps: number, defensePower: number, defenseHealth: number, criticalDamage: number, criticalChance: number): void {
  const calculatedStats: CalculatedDefenseStatsInterface = {
    totalDps: totalDps,
    critChance: criticalChance,
    critDamage: criticalDamage,
    defenseHealth: defenseHealth,
    defensePower: defensePower,
  }

  if (defense.defenseData?.id === 'BoostAura' || defense.defenseData?.id === 'BuffBeam') {
    calculatedStats.totalDps = 0

    const currentCalculatedStats = defensesStats.value[defense.incrementId]
    if (!currentCalculatedStats || JSON.stringify(currentCalculatedStats) !== JSON.stringify(calculatedStats)) {
      defenseBoosts.value[defense.incrementId] = calculatedStats
    }
  }

  defensesStats.value[defense.incrementId] = calculatedStats
}

function addDefense(): void {
  defenseSelect.value = true
}

function deleteDefense(defenseIncrementId: number): void {
  // Remove defense from defenseBoosts if it exists
  if (defenseBoosts.value[defenseIncrementId]) {
    delete defenseBoosts.value[defenseIncrementId]
  }
  props.defenseSetup.defensesIncrementIds.splice(props.defenseSetup.defensesIncrementIds.indexOf(defenseIncrementId), 1)
  defensesStats.value[defenseIncrementId].totalDps = 0
}

function selectDefense(): void {
  if (selectedDefense.value === null || selectedDefense.value === 0) {
    return
  }
  props.defenseSetup.defensesIncrementIds.push(selectedDefense.value)
  defenseSelect.value = false
  selectedDefense.value = null
}

onMounted((): void => {
  id.value = 'id' + Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
      .toLowerCase();
})
</script>

<style scoped>
  .add-btn {
    margin-left: 1rem;
  }

  .setup {
    position: relative;
  }

  .setup__toolbar_total-dps {
    font-size: 1.1rem;
    font-weight: bold;
    height: 100%;
    display: flex;
    align-items: center;
    margin-right: 10px;
  }
</style>
