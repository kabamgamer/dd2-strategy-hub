<template>
  <div class="setup">
    <div class="setup__toolbar d-flex justify-content-between mb-2">
      <div class="setup__toolbar_left">
        <h3><input type="text" v-model="defenseSetup.label" class="form-control-plaintext p-0"> <span v-if="defenses.length === 0">(Configure a defense first)</span></h3>
      </div>

      <div class="setup__toolbar_right d-flex">
        <div class="setup__toolbar_stats d-flex">
          <div class="setup__toolbar_stats__stat setup__toolbar_total-du">
            DU: {{ totalDu }}
          </div>
          <div class="setup__toolbar_stats__stat setup__toolbar_total-dps">
            DPS: {{ Math.round(totalDps).toLocaleString('en-US') }}
          </div>
        </div>

        <div class="setup__toolbar_actions">
          <button class="btn btn-danger delete-btn" @click.prevent="deleteDefenseSetup(defenseSetup.incrementId)">
            Delete
          </button>
          <button ref="shareButtonElement" class="btn btn-info share-btn" @click.prevent="shareSetup">
            Share
          </button>
          <button class="btn btn-primary add-btn" :class="{ disabled: defenses.length === 0 }" :disabled="defenses.length === 0" @click.prevent="addDefense">
            Add defense
          </button>
        </div>
      </div>
    </div>

    <hr class="w-100" />

    <DefenseSetupModifiers :setupIncrementId="defenseSetup.incrementId" v-model="defenseSetup.modifiers" />

    <div class="row">
      <div class="col-md-4" v-for="defense in setupDefenses" :key="defense.incrementId">
        <Defense
            :defense="defense"
            :setupDefenses="setupDefenses"
            :setupDefenseOptions="defenseSetup.defenses"
            :defenseBoosts="defenseBoosts"
            :setupModifiers="defenseSetup.modifiers"
            @total-dps-calculated="(totalDps: number, defensePower: number, defenseHealth: number, criticalDamage: number, criticalChance: number) => {
              onDefenseDpsCalculated(defense, totalDps, defensePower, defenseHealth, criticalDamage, criticalChance)
            }"
        >
          <template #defense-details>
            <div class="setup-defense-options" v-if="defense.defenseData && !defense.defenseData.isUnique && defense.userData.id !== 'BoostAura'">
              <hr />

              <div class="mb-3 row">
                <label for="defenseCount" class="col-sm-4 col-form-label" v-if="defense.defenseData?.hero === 'Ev2'">Node count:</label>
                <label for="defenseCount" class="col-sm-4 col-form-label" v-else>Defense count:</label>
                <div class="col-sm-8">
                  <input type="number" v-model="defenseSetup.defenses[defense.incrementId].defenseCount" class="form-control" id="defenseCount">
                </div>
              </div>
            </div>

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
                <option :value="null" selected>
                  Select a defense
                </option>
                <option v-for="defense in defenseSelection" :key="defense.incrementId" :value="defense">
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
import { useUserDataStore, getDefaultSetupModifiers } from "@/stores/UserData"
import { useShortUrl } from "@/composables/ShortUrl"
import { storeToRefs } from "pinia"
import type { UserDefenseSetupInterface, CalculatedDefenseStatsInterface } from "@/interaces";

import Defense from "@/components/utilities/Defense.vue";
import DefenseSetupModifiers from "@/components/utilities/DefenseSetupModifiers.vue";

const props = defineProps({
  defenseSetup: {
    type: Object as PropType<UserDefenseSetupInterface>,
    required: true,
  },
})

if (props.defenseSetup.modifiers === undefined) {
  props.defenseSetup.modifiers = getDefaultSetupModifiers()
}

const { shortenUrl } = useShortUrl()
const userStore = useUserDataStore()

const { defenses } = storeToRefs(userStore)
const { deleteDefenseSetup } = userStore

const id = ref<string>()
const shareButtonElement = ref()
const defensesStats = ref<{[incrementId: number]: CalculatedDefenseStatsInterface}>({})
const defenseBoosts = ref<{[incrementId: number]: CalculatedDefenseStatsInterface}>({})
const defenseSelect = ref<boolean>(false)
const selectedDefense = ref<UserDataStoreDefenseInterface|null>(null)

const setupDefenses = computed(() => defenses.value.filter((defense) => props.defenseSetup.defenses[defense.incrementId] !== undefined))
const defenseSelection = computed(() => defenses.value.filter((defense) => defense.userData && props.defenseSetup.defenses[defense.incrementId] === undefined))
const totalDu = computed((): number => setupDefenses.value.reduce((accumulator, defense: UserDataStoreDefenseInterface) => accumulator + ((defense.defenseData?.defenseUnits ?? 0) * props.defenseSetup.defenses[defense.incrementId].defenseCount), 0))
const totalDps = computed((): number => {
  let totalDps = 0

  for (const defense of setupDefenses.value) {
    const defenseStats = defensesStats.value[defense.incrementId]
    if (defenseStats) {
      totalDps += defenseStats.totalDps * props.defenseSetup.defenses[defense.incrementId].defenseCount
    }
  }

  return totalDps
})

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
  delete props.defenseSetup.defenses[defenseIncrementId]
  defensesStats.value[defenseIncrementId].totalDps = 0
}

function selectDefense(): void {
  if (selectedDefense.value === null || selectedDefense.value === 0) {
    return
  }
  props.defenseSetup.defenses[selectedDefense.value.incrementId] = {defenseCount: selectedDefense.value.defenseData.hero !== 'Ev2' ? 1 : 2}
  defenseSelect.value = false
  selectedDefense.value = null
}

async function shareSetup(): Promise<void> {
  const sharableLink = encodeURI(window.location.origin + '?shared=' + JSON.stringify({defenses: setupDefenses.value.map((defense: UserDataStoreDefenseInterface) => defense.userData), setups: [props.defenseSetup]}))

  navigator.clipboard.writeText(await shortenUrl(sharableLink));

  shareButtonElement.value.classList.add('coppied')
  setTimeout(() => {
    shareButtonElement.value.classList.remove('coppied')
  }, 5000)

  return Promise.resolve()
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

  .setup__toolbar_stats {
    font-size: 1.1rem;
    font-weight: bold;
    height: 100%;
    display: flex;
    align-items: center;
    margin-right: 10px;
  }
  .setup__toolbar_stats__stat {
    margin-left: 15px;
  }

  .share-btn {
    margin-left: 1rem;
    position: relative
  }
  .share-btn.coppied::after {
    background: var(--bs-secondary-bg-subtle);
    color: var(--bs-body-color);
    border-radius: 4px;
    bottom: 120%;
    content: 'Coppied to clipboard! Share this URL with your friends.';
    display: block;
    left: -175%;
    padding: 1em;
    position: absolute;
    width: 280px;
    z-index: 1;
  }
</style>
