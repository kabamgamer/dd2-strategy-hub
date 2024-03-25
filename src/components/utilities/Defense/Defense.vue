<template>
  <LoadingSpinner v-if="!defense.defenseData" />
  <template v-else>
    <DefenseOverviewTableRow
        v-if="tableView"
        :defense="defense"
        :icon="defense.defenseData?.icon"
        :label="defense.userData.label"
        :defenseLevel="defenseLevel"
        :in-setup="setupDefenses !== undefined"
        :is-buff-defense="defense.isBuffDefense"
        :defense-stats="defenseStats"
        :selected="selected"
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
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onMounted, computed, reactive, toRefs } from "vue";
import type { PropType, UnwrapNestedRefs } from "vue";
import type {
  CalculatedDefenseStatsInterface,
  DefenseSetupModifiersInterface,
  UserSetupDefenseInterface,
  DefenseStatsInterface
} from "@/types";

import type { UserDataStoreDefenseInterface } from "@/stores/UserData";

import { useDefenseCalculations } from "@/composables/Defense/DefenseCalculations";
import { useUserDataStore } from "@/stores/UserData";
import DefenseOverviewTableRow from "@/components/utilities/Defense/Overview/Table/DefenseOverviewTableRow.vue";
import DefenseOverviewAccordionItem from "@/components/utilities/Defense/Overview/Accordion/DefenseOverviewAccordionItem.vue";
import LoadingSpinner from "@/components/layout/LoadingSpinner.vue";

const userStore = useUserDataStore();

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
  selected: Boolean,
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
  attackDamage: attackDamage.value,
}))

const { setupDefenses, setupDefenseOptions, defenseBoosts, setupModifiers } = toRefs(props)

const { deleteDefense } = userStore
const { totalDps, tooltipDps, attackDamage, 
  attackRate, defensePower, defenseHitPoints, 
  defenseRange, criticalDamage, criticalChance, 
  defenseSpecificStats 
// @ts-ignore
} = useDefenseCalculations(defense, defenseLevel, setupDefenses, setupDefenseOptions, defenseBoosts, setupModifiers)

function onDefenseCalculationUpdate(): void {
  emit('total-dps-calculated', totalDps.value, defensePower.value, defenseHitPoints.value, criticalDamage.value, criticalChance.value)
}

watch(totalDps, onDefenseCalculationUpdate)

if (defense.isBuffDefense) {
  watch(defensePower, onDefenseCalculationUpdate)
  watch(criticalDamage, onDefenseCalculationUpdate)
}

onMounted((): void => {
  id.value = 'id' + Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
      .toLowerCase() + defense.incrementId
})
</script>
