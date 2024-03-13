<template>
  <Defense
    :defense="defense"
    :all-checked="allChecked"
    :setupDefenses="setupDefenses"
    :setupDefenseOptions="defenseSetup.defenses"
    :defenseBoosts="defenseBoosts"
    :setupModifiers="defenseSetup.modifiers"
    :table-view="tableView"
    @total-dps-calculated="onTotalDpsCalculated"
  >
    <template #accordion-defense-details>
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
        <button class="btn btn-danger" @click.prevent="$emit('deleteDefense', defense.incrementId)">
          Delete
        </button>
      </div>
    </template>
  </Defense>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

import type { PropType } from "vue";

import type { UserDataStoreDefenseInterface } from "@/stores/UserData";
import type {
  CalculatedDefenseStatsInterface,
  DefenseSetupModifiersInterface,
  UserDefenseSetupInterface,
  UserSetupDefenseInterface
} from "@/types";

import Defense from "@/components/utilities/Defense/Defense.vue";

const props = defineProps({
  defense: {
    type: Object as PropType<UserDataStoreDefenseInterface>,
    required: true,
  },
  tableView: {
    type: Boolean,
    default: false,
  },
  defenseSetup: {
    type: Object as PropType<UserDefenseSetupInterface>,
    required: true,
  },
  allChecked: Boolean,
  setupDefenses: Object as PropType<UserDataStoreDefenseInterface[]|undefined>,
  setupDefenseOptions: Object as PropType<{ [defensesIncrementId: number]: UserSetupDefenseInterface }|undefined>,
  defenseBoosts: Object as PropType<{[incrementId: number]: CalculatedDefenseStatsInterface}|undefined>,
  setupModifiers: Object as PropType<DefenseSetupModifiersInterface|undefined>,
});

const emit = defineEmits(['totalDpsCalculated', 'deleteDefense']);

function onTotalDpsCalculated(): void {
  emit('totalDpsCalculated', props.defense, ...arguments)
}
</script>

<style scoped>

</style>