<template>
  <DefenseOverviewTableRow
      v-if="tableView"
      :defense="defense"
      :icon="defense.defenseData?.icon"
      :label="defense.userData.label"
      :defenseLevel="defenseLevel"
      :defense-specific-stats="defenseSpecificStats"
      :in-setup="setupDefenses !== undefined"
      :is-buff-defense="defense.isBuffDefense"
      :defense-stats="defenseStats"
      :selected="selected"
      :sort-rows="sortRows"
      @defense-level-update="(newDefenseLevel) => defenseLevel = newDefenseLevel"
      @row-select="(value) => $emit('row-select', defense.incrementId, value)"
      @defense-edit="() => $emit('defense-edit', defense)"
  >
    <template #default>
      <slot name="table-row-defense-details"></slot>
    </template>
  </DefenseOverviewTableRow>

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
      :is-buff-defense="defense.isBuffDefense"
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
import { ref, watch, defineProps, defineEmits, onMounted, computed, reactive, toRefs, onBeforeUnmount } from "vue";
import type { PropType, UnwrapNestedRefs, Ref } from "vue";
import type {
  CalculatedDefenseStatsInterface,
  DefenseSetupModifiersInterface,
  UserSetupDefenseInterface,
  DefenseStatsInterface,
  DefenseStatInterface,
} from "@/types";

import type { UserDataStoreDefenseInterface } from "@/stores/UserData";
import type { CalculationConditionsInterface } from "@/composables/Defense/DefenseCalculations";

import { useDefenseCalculations } from "@/composables/Defense/DefenseCalculations";
import { useUserDataStore } from "@/stores/UserData";
import DefenseOverviewTableRow from "@/components/utilities/Defense/Overview/Table/DefenseOverviewTableRow.vue";
import DefenseOverviewAccordionItem from "@/components/utilities/Defense/Overview/Accordion/DefenseOverviewAccordionItem.vue";

const userStore = useUserDataStore();

const emit = defineEmits(['total-dps-calculated', 'row-select', 'defense-edit', 'defense-specific-stats'])
const props = defineProps({
  defense: {
    type: Object as PropType<UserDataStoreDefenseInterface>,
    required: true,
  },
  tableView: {
    type: Boolean,
    default: false,
  },
  selected: Boolean,
  sortRows: Boolean,
  collapsed: Boolean,
  setupDefenses: Object as PropType<UserDataStoreDefenseInterface[]|undefined>,
  setupDefenseOptions: Object as PropType<{ [defensesIncrementId: number]: UserSetupDefenseInterface }|undefined>,
  defenseBoosts: Object as PropType<{[incrementId: number]: CalculatedDefenseStatsInterface}|undefined>,
  setupModifiers: Object as PropType<DefenseSetupModifiersInterface|undefined>,
});

const defense: UnwrapNestedRefs<UserDataStoreDefenseInterface> = reactive(props.defense)

const id = ref<string>()
const defenseLevel = ref<number>(1)
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
  tooltipAttackDamage: tooltipAttackDamage.value,
  totalAttackDamage: totalAttackDamage
}))

const { setupDefenses, setupDefenseOptions, defenseBoosts, setupModifiers } = toRefs(props) as {
  setupDefenses: Ref<UserDataStoreDefenseInterface[] | undefined>,
  setupDefenseOptions: Ref<{ [defensesIncrementId: number]: UserSetupDefenseInterface } | undefined>,
  defenseBoosts: Ref<{[incrementId: number]: CalculatedDefenseStatsInterface} | undefined>,
  setupModifiers: Ref<DefenseSetupModifiersInterface | undefined>,
}

const calculationConditions: CalculationConditionsInterface = {
  defenseLevel,
  setupDefenses,
  setupDefenseOptions,
  defenseBoosts,
  setupModifiers,
}

const { deleteDefense } = userStore
const { totalDps, tooltipDps, tooltipAttackDamage,
  attackRate, defensePower, defenseHitPoints, 
  defenseRange, criticalDamage, criticalChance, 
  defenseSpecificStats, totalAttackDamage
// @ts-ignore
} = useDefenseCalculations(defense, calculationConditions)

function onDefenseCalculationUpdate(): void {
  emit('total-dps-calculated', totalDps.value, defensePower.value, defenseHitPoints.value, criticalDamage.value, criticalChance.value)
}

watch(totalDps, onDefenseCalculationUpdate, { immediate: true })
watch(defenseSpecificStats, (newValue?: DefenseStatInterface<any>[], oldValue?: DefenseStatInterface<any>[]) => {
  const addedStats: DefenseStatInterface<any>[] = newValue?.filter(stat => !oldValue?.some(statToCheck => statToCheck.label === stat.label)) ?? []
  const removedStats: DefenseStatInterface<any>[] = oldValue?.filter(stat => !newValue?.some(statToCheck => statToCheck.label === stat.label)) ?? []
  emit('defense-specific-stats', addedStats, removedStats)
}, { immediate: true })

if (defense.isBuffDefense) {
  watch(defensePower, onDefenseCalculationUpdate)
  watch(criticalDamage, onDefenseCalculationUpdate)
}

onBeforeUnmount((): void => {
  emit('defense-specific-stats', [], defenseSpecificStats.value)
})
onMounted((): void => {
  id.value = 'id' + Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
      .toLowerCase() + defense.incrementId
})
</script>
