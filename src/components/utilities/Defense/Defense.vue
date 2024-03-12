<template>
  <DefenseOverviewTableRow
      v-if="tableView"
      :defense="defense"
      :icon="defense.defenseData?.icon"
      :label="defense.userData.label"
      :defenseLevel="defenseLevel"
      :in-setup="setupDefenses !== undefined"
      :is-buff-defense="isBuffDefense()"
      :defense-stats="defenseStats"
      :all-checked="allChecked"
      @defense-level-update="(newDefenseLevel) => defenseLevel = newDefenseLevel"
      @row-select="(value) => $emit('row-select', defense.incrementId, value)"
      @defense-edit="() => $emit('defense-edit', defense)"
  />

  <DefenseOverviewAccordionItem
      v-else
      :id="id"
      :collapsed="collapsed"
      :defenseLevel="defenseLevel"
      :defense-specific-stats="defenseSpecificStats"
      :icon="defense.defenseData?.icon"
      :label="defense.userData.label"
      :defense="defense"
      :in-setup="setupDefenses !== undefined"
      :is-buff-defense="isBuffDefense()"
      :defense-stats="defenseStats"
      @defense-level-update="(newDefenseLevel) => defenseLevel = newDefenseLevel"
      @defense-delete="deleteDefense"
      class="mb-3"
  >
    <template #defense-details>
      <slot name="accordion-defense-details"></slot>
    </template>
  </DefenseOverviewAccordionItem>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onMounted, computed } from "vue";
import type { PropType } from "vue";
import type {
  CalculatedDefenseStatsInterface,
  DefenseSetupModifiersInterface,
  UserSetupDefenseInterface,
  DefenseStatsInterface
} from "@/types";

import type DefenseModData from "@/data/DefenseModData";
import type DefenseShardData from "@/data/DefenseShardData";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";

import { useDebounce } from "@/composables/Debounce";
import { useDefenseCalculations } from "@/composables/DefenseCalculations";
import { useModStore } from "@/stores/ModInfo"
import { useShardStore } from "@/stores/ShardInfo"
import { useUserDataStore } from "@/stores/UserData";
import { storeToRefs } from "pinia";
import ModType from "@/enums/ModType";
import DefenseOverviewTableRow from "@/components/utilities/Defense/Overview/Table/DefenseOverviewTableRow.vue";
import DefenseOverviewAccordionItem from "@/components/utilities/Defense/Overview/Accordion/DefenseOverviewAccordionItem.vue";

const userStore = useUserDataStore();

const { debounce } = useDebounce()
const { deleteDefense } = userStore
const { ancientPowerPoints } = storeToRefs(userStore);
const { totalDps, tooltipDps, attackDamage, attackRate, defensePower, defenseHitPoints, defenseRange, criticalDamage, criticalChance, calculateDefensePower, defenseSpecificStats, isBuffDefense } = useDefenseCalculations()
const { getModById } = useModStore()
const { getShardById } = useShardStore()

const emit = defineEmits(['total-dps-calculated', 'row-select', 'defense-edit'])
const props = defineProps({
  defense: {
    type: Object as PropType<UserDataStoreDefenseInterface>,
    required: true,
  },
  tableView: {
    type: Boolean,
    default: false,
  },
  collapsed: Boolean,
  allChecked: Boolean,
  setupDefenses: Object as PropType<UserDataStoreDefenseInterface[]|undefined>,
  setupDefenseOptions: Object as PropType<{ [defensesIncrementId: number]: UserSetupDefenseInterface }|undefined>,
  defenseBoosts: Object as PropType<{[incrementId: number]: CalculatedDefenseStatsInterface}|undefined>,
  setupModifiers: Object as PropType<DefenseSetupModifiersInterface|undefined>,
});

const defense: UserDataStoreDefenseInterface = props.defense as UserDataStoreDefenseInterface

let defenseBoosts: {[incrementId: number]: CalculatedDefenseStatsInterface}|undefined;

const id = ref<string>()
const defenseLevel = ref<number>(1)
const hasDiverseMods = ref<boolean>(false)
const userDefenseMods = ref<DefenseModData[]>([])
const userDefenseShards = ref<DefenseShardData[]>([])
const userSetupDefensesShards = ref<{ [defenseIncrementId: number]: DefenseShardData[] }>({})
const isLoadingDefenseSetupShards = ref<boolean>(false)
const attackRatePercentage = computed(() => Math.round((attackRate.value - (defense.defenseData?.baseAttackRate ?? 0)) / ((defense.defenseData?.maxAttackRate ?? 0) - (defense.defenseData?.baseAttackRate ?? 0)) * 100))
const defenseStats = computed((): DefenseStatsInterface => ({
  defensePower: defensePower.value,
  defenseHitPoints: defenseHitPoints.value,
  defenseRange: defenseRange.value,
  criticalDamage: criticalDamage.value,
  criticalChance: criticalChance.value,
  tooltipDps: tooltipDps.value,
  totalDps: totalDps.value,
  attackRate: attackRate.value,
  attackRatePercentage: attackRatePercentage.value,
  attackDamage: attackDamage.value,
}))

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

watch(defense.userData, recalculate, { deep: true })
watch(userDefenseMods, debounce(() => {
hasDiverseMods.value = userDefenseMods.value.filter((mod: any) => (mod as DefenseModData).type?.equals(ModType.Diverse)).length > 0
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
