<template>
  <div class="setup">
    <div class="setup__toolbar d-flex justify-content-between mb-2">
      <div class="setup__toolbar_left">
        <h4><input type="text" v-model="defenseSetup.label" maxlength="25" class="form-control-plaintext p-0"> <span v-if="defenses.length === 0">(Configure a defense first)</span></h4>
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
      <template #defense-list="{ defense, selected, selectDefenseCallback }">
        <SetupDefense
          :defense="defense"
          :selected="selected"
          :setupDefenses="setupDefenses"
          :defenseSetup="defenseSetup"
          :defenseBoosts="defenseBoosts"
          @row-select="selectDefenseCallback"
          @total-dps-calculated="onDefenseDpsCalculated"
          table-view
        />
      </template>

      <template #headers>
        <th>Amount</th>
      </template>
    </DefenseOverviewTable>
  </div>

  <BootstrapModal title="Select defense" ref="addDefenseModal">
    <template #body>
      <select class="form-select" @change="selectDefense" v-model="selectedDefense">
        <option :value="null" selected>
          Select a defense
        </option>
        <option v-for="defense in defenseSelection" :key="defense.incrementId" :value="defense">
          {{ defense.userData.label }}
        </option>
      </select>
    </template>
  </BootstrapModal>
</template>

<script lang="ts" setup>
import { ref, onMounted, defineProps, computed, toRef } from "vue"
import type { PropType, ToRef } from "vue"

import type { UserDataStoreDefenseInterface } from "@/stores/UserData"
import { useUserDataStore, getDefaultSetupModifiers } from "@/stores/UserData"
import { useShortUrl } from "@/composables/ShortUrl"
import { storeToRefs } from "pinia"
import type { UserDefenseSetupInterface, CalculatedDefenseStatsInterface } from "@/types";

import DefenseSetupModifiers from "@/components/utilities/Setup/DefenseSetupModifiers.vue";
import DefenseOverviewTable from "@/components/utilities/Defense/Overview/Table/DefenseOverviewTable.vue";
import DefenseOverviewAccordion from "@/components/utilities/Defense/Overview/Accordion/DefenseOverviewAccordion.vue";
import SetupDefense from "@/components/utilities/Setup/SetupDefense.vue";
import BootstrapModal from "@/components/layout/BootstrapModal.vue";

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
const addDefenseModal = ref()
const defensesStats = ref<{[incrementId: number]: CalculatedDefenseStatsInterface}>({})
const selectedDefense = ref<UserDataStoreDefenseInterface|null>(null)

// TODO Reorder setup defenses when table is reordered
const setupDefenses = computed<UserDataStoreDefenseInterface[]>({
  get: () => defenses.value.filter((defense) => defenseSetup.value.defenses[defense.incrementId] !== undefined),
  set: (value: UserDataStoreDefenseInterface[]) => {
    const defenses: {[incrementId: number]: {defenseCount: number}} = {}
    value.forEach((defense) => {
      defenses[defense.incrementId] = defenseSetup.value.defenses[defense.incrementId]
    })
    defenseSetup.value.defenses = defenses
  },
})
const defenseSelection = computed(() => defenses.value.filter((defense) => defense.userData && defenseSetup.value.defenses[defense.incrementId] === undefined))
const defenseBoosts = computed<{[incrementId: number]: CalculatedDefenseStatsInterface}>(() => {
  const resolvedDefenseBoosts: {[incrementId: number]: CalculatedDefenseStatsInterface} = {}

  for (const setupDefense of setupDefenses.value) {
    const calculatedStats: undefined|CalculatedDefenseStatsInterface = defensesStats.value[setupDefense.incrementId]

    if (!calculatedStats) {
      continue
    }

    const statBoosts = {
      totalDps: 0,
      critChance: 0,
      critDamage: 0,
      defenseHealth: 0,
      defensePower: 0,
    }

    if (setupDefense.defenseData?.id === 'BoostAura' || setupDefense.defenseData?.id === 'BuffBeam') {
      statBoosts.defensePower = calculatedStats.defensePower / 10
      statBoosts.critDamage = calculatedStats.critDamage / 4
      calculatedStats.totalDps = 0
    }

    for (const shard of setupDefense.userShards) {
      if (shard.defensePower?.mutators.pylon?.fromSelf) {
        statBoosts.defensePower += calculatedStats.defensePower * (shard.defensePower.percentage ?? 0) / 100
      }
    }

    if (Object.values(statBoosts).reduce((accumulator, boost) => accumulator + boost, 0) > 0) {
      resolvedDefenseBoosts[setupDefense.incrementId] = statBoosts
    }
  }

  return resolvedDefenseBoosts
})
const totalDu = computed((): number => setupDefenses.value.reduce((accumulator: number, defense: UserDataStoreDefenseInterface) => {
  if (!defense.defenseData) {
    return accumulator
  }

  let defenseUnits: number = defense.defenseData.defenseUnits;
  let defenseCount: number = (props.defenseSetup as UserDefenseSetupInterface).defenses[defense.incrementId].defenseCount;

  if (defenseCount < 1) {
    return accumulator
  }

  if (defense.defenseData.id === 'ProtonBeam') {
    accumulator += defenseUnits;
    defenseCount -= 1;
    defenseUnits = 10;
  }

  if (defense.defenseData.id === 'WeaponManufacturer') {
    if (defenseCount === 1) {
      return accumulator + defenseUnits
    }

    // Weapon Manufacturer's main node
    accumulator += defenseUnits;

    // Weapon Manufacturer's second node
    accumulator += 10;

    // Weapon Manufacturer's remaining nodes
    defenseUnits = 20;
    defenseCount -= 2;
  }

  return accumulator + defenseUnits * defenseCount
}, 0))
const totalDps = computed((): number => {
  let calculatedTotalDps = 0

  for (const defense of setupDefenses.value) {
    const defenseStats = defensesStats.value[defense.incrementId]
    if (defenseStats) {
      let defenseCount = defense.defenseData?.type === 'Node' ? defenseSetup.value.defenses[defense.incrementId].defenseCount-1 : defenseSetup.value.defenses[defense.incrementId].defenseCount
      defenseCount = defenseCount < 0 ? 0 : defenseCount
      calculatedTotalDps += defenseStats.totalDps * defenseCount
    }
  }

  return calculatedTotalDps
})

function onDefenseDpsCalculated(defense: UserDataStoreDefenseInterface, totalDps: number, defensePower: number, defenseHealth: number, criticalDamage: number, criticalChance: number): void {
  const calculatedStats: CalculatedDefenseStatsInterface = {
    totalDps: totalDps,
    critChance: criticalChance,
    critDamage: criticalDamage,
    defenseHealth: defenseHealth,
    defensePower: defensePower,
  }

  defensesStats.value[defense.incrementId] = calculatedStats
}

function addDefense(): void {
  addDefenseModal.value.show()
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
  addDefenseModal.value.hide()
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

<style lang="scss" scoped>
  .add-btn {
    margin-left: 1rem;
  }

  .setup {
    position: relative;
  }

  .setup__toolbar {
    &_stats {
      font-size: 1.1rem;
      font-weight: bold;
      height: 100%;
      display: flex;
      align-items: center;
      margin-right: 10px;

      &__stat {
        margin-left: 15px;
      }
    }

    &_left {
      @media (min-width: 992px) {
        width: 400px;
      }
    }
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
