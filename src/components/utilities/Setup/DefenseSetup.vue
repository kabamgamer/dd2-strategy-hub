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

    <DefenseOverviewAccordion v-if="!tableView" :defenses="setupDefenses">
      <template #defense-list="{ defense }">
        <div class="col-md-4">
          <SetupDefense
            :defense="defense"
            :setupDefenses="setupDefenses"
            :defenseSetup="defenseSetup"
            :defenseBoosts="defenseBoosts"
            @total-dps-calculated="onDefenseDpsCalculated"
            @delete-defense="deleteDefense"
          />
        </div>
      </template>
    </DefenseOverviewAccordion>
    <DefenseOverviewTable v-else :defenses="setupDefenses" @delete-defense="deleteDefense">
      <template #defense-list="{ defense, allChecked, selectDefenseCallback }">
        <SetupDefense
          :defense="defense"
          :allChecked="allChecked"
          :setupDefenses="setupDefenses"
          :defenseSetup="defenseSetup"
          :defenseBoosts="defenseBoosts"
          @row-select="selectDefenseCallback"
          @total-dps-calculated="onDefenseDpsCalculated"
          table-view
        />
      </template>
    </DefenseOverviewTable>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, defineProps, computed, toRef } from "vue"
import type { PropType, ToRef } from "vue"

import type { UserDataStoreDefenseInterface } from "@/stores/UserData"
import { useUserDataStore, getDefaultSetupModifiers } from "@/stores/UserData"
import { useShortUrl } from "@/composables/ShortUrl"
import { storeToRefs } from "pinia"
import type { UserDefenseSetupInterface, CalculatedDefenseStatsInterface } from "@/types";
import type DefenseShardData from "@/data/DefenseShardData";

import DefenseSetupModifiers from "@/components/utilities/Setup/DefenseSetupModifiers.vue";
import DefenseOverviewTable from "@/components/utilities/Defense/Overview/Table/DefenseOverviewTable.vue";
import DefenseOverviewAccordion from "@/components/utilities/Defense/Overview/Accordion/DefenseOverviewAccordion.vue";
import SetupDefense from "@/components/utilities/Setup/SetupDefense.vue";

const props = defineProps({
  defenseSetup: {
    type: Object as PropType<UserDefenseSetupInterface>,
    required: true,
  },
})

const defenseSetup: ToRef<UserDefenseSetupInterface> = toRef(props, 'defenseSetup') as ToRef<UserDefenseSetupInterface>

if (defenseSetup.value.modifiers === undefined) {
  defenseSetup.value.modifiers = getDefaultSetupModifiers()
}

const { shortenUrl } = useShortUrl()
const userStore = useUserDataStore()

const { defenses, tableView } = storeToRefs(userStore)
const { deleteDefenseSetup } = userStore

const id = ref<string>()
const shareButtonElement = ref()
const defensesStats = ref<{[incrementId: number]: CalculatedDefenseStatsInterface}>({})
const defenseBoosts = ref<{[incrementId: number]: CalculatedDefenseStatsInterface}>({})
const defenseSelect = ref<boolean>(false)
const selectedDefense = ref<UserDataStoreDefenseInterface|null>(null)

const setupDefenses = computed(() => defenses.value.filter((defense) => defenseSetup.value.defenses[defense.incrementId] !== undefined))
const defenseSelection = computed(() => defenses.value.filter((defense) => defense.userData && defenseSetup.value.defenses[defense.incrementId] === undefined))
const totalDu = computed((): number => setupDefenses.value.reduce((accumulator, defense: UserDataStoreDefenseInterface) => accumulator + ((defense.defenseData?.defenseUnits ?? 0) * props.defenseSetup.defenses[defense.incrementId].defenseCount), 0))
const totalDps = computed((): number => {
  let calculatedTotalDps = 0

  for (const defense of setupDefenses.value) {
    const defenseStats = defensesStats.value[defense.incrementId]
    if (defenseStats) {
      calculatedTotalDps += defenseStats.totalDps * defenseSetup.value.defenses[defense.incrementId].defenseCount
    }
  }

  return calculatedTotalDps
})

function onDefenseDpsCalculated(defense: UserDataStoreDefenseInterface, totalDps: number, defensePower: number, defenseHealth: number, criticalDamage: number, criticalChance: number, defenseShards: DefenseShardData[]): void {
  const calculatedStats: CalculatedDefenseStatsInterface = {
    totalDps: totalDps,
    critChance: criticalChance,
    critDamage: criticalDamage,
    defenseHealth: defenseHealth,
    defensePower: defensePower,
  }

  const resolvedDefenseBoosts = defenseBoosts.value
  resolvedDefenseBoosts[defense.incrementId] = {
    totalDps: 0,
    critChance: 0,
    critDamage: 0,
    defenseHealth: 0,
    defensePower: 0,
  }

  if (defense.defenseData?.id === 'BoostAura' || defense.defenseData?.id === 'BuffBeam') {
    resolvedDefenseBoosts[defense.incrementId].defensePower = calculatedStats.defensePower / 10
    resolvedDefenseBoosts[defense.incrementId].critDamage = calculatedStats.critDamage / 4
    calculatedStats.totalDps = 0
  }

  for (const shard of defenseShards) {
    if (shard.defensePower?.mutators.pylon?.fromSelf) {
      resolvedDefenseBoosts[defense.incrementId].defensePower += calculatedStats.defensePower * (shard.defensePower.percentage ?? 0) / 100
    }
  }

  for (const defenseIncrementId in resolvedDefenseBoosts) {
    const defenseBoosts = resolvedDefenseBoosts[defenseIncrementId]
    if (Object.values(defenseBoosts).reduce((accumulator, boost) => accumulator + boost, 0) === 0) {
      delete resolvedDefenseBoosts[defenseIncrementId]
    }
  }

  defenseBoosts.value = resolvedDefenseBoosts
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
  if (selectedDefense.value === null) {
    return
  }
  props.defenseSetup.defenses[selectedDefense.value.incrementId] = {defenseCount: selectedDefense.value.defenseData?.hero !== 'Ev2' ? 1 : 2}
  defenseSelect.value = false
  selectedDefense.value = null
}

async function shareSetup(): Promise<void> {
  const sharableLink = encodeURI(window.location.origin + '?shared=' + JSON.stringify({defenses: setupDefenses.value.map((defense: UserDataStoreDefenseInterface) => defense.userData), setups: [props.defenseSetup]}))

  navigator.clipboard.writeText(await shortenUrl(sharableLink));

  shareButtonElement.value.classList.add('copied')
  setTimeout(() => {
    shareButtonElement.value.classList.remove('copied')
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
  .share-btn.copied::after {
    background: var(--bs-secondary-bg-subtle);
    color: var(--bs-body-color);
    border-radius: 4px;
    bottom: 120%;
    content: 'Copied to clipboard! Share this URL with your friends.';
    display: block;
    left: -175%;
    padding: 1em;
    position: absolute;
    width: 280px;
    z-index: 1;
  }
</style>
