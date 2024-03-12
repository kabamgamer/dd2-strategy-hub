<template>
  <div class="toolbar d-flex justify-content-between mb-3">
    <div class="text-muted">
      All shards are considered gilded and all mods are considered c8 10/10
    </div>

    <div class="toolbar__actions">
      <button class="btn btn-danger mx-2" :disabled="deleteDefensesDisabled" v-if="tableView" @click="deleteDefenses">{{ deleteDefensesLabel }}</button>
      <button class="btn btn-primary" @click="addDefense">Add defense</button>
    </div>
  </div>

  <DefenseOverviewAccordion v-if="!tableView" :defenses="defenses" />
  <DefenseOverviewTable
      v-else
      ref="defenseOverviewTable"
      :defenses="defenses"
      :select-all="selectAll"
      @select-all="(selected: boolean) => selectAll = selected"
      @row-select="(defenseIncrementId: number, selected: boolean) => selectedDefenses[defenseIncrementId] = selected"
  />

  <BootstrapModal title="Select a defense" ref="defenseSelectionModal">
    <template #body>
      <DefenseSelection @change="onDefenseSelection" clear-on-select />
    </template>
  </BootstrapModal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useUserDataStore } from "@/stores/UserData";

import type { DefenseRootInterface } from "@/types";
import PetData from "@/classes/Pet";
import RelicData from "@/classes/Relic";
import BootstrapModal from "@/components/layout/BootstrapModal.vue";
import DefenseSelection from "@/components/utilities/Defense/DefenseSelection.vue";
import DefenseOverviewTable from "@/components/utilities/Defense/Overview/Table/DefenseOverviewTable.vue";
import DefenseOverviewAccordion from "@/components/utilities/Defense/Overview/Accordion/DefenseOverviewAccordion.vue";

const userStore = useUserDataStore()
const { defenses, tableView } = storeToRefs(userStore);
const { getNextDefenseIncrementId, deleteDefense } = userStore;

const defenseOverviewTable = ref();
const defenseSelectionModal = ref<InstanceType<typeof BootstrapModal>>();
const selectAll = ref<boolean>(false);
const selectedDefenses = ref<{ [defenseIncrementId: number]: boolean }>({});

const selectedDefensesIncrementIds = computed(() => Object.entries(selectedDefenses.value).filter(([, selected]) => selected).map(([defenseIncrementId]) => +defenseIncrementId));
const deleteDefensesDisabled = computed(() => !selectAll.value && selectedDefensesIncrementIds.value.length === 0);
const deleteDefensesLabel = computed(() => {
  if (selectAll.value) {
    return "Delete all defenses";
  }

  const selectedDefensesCount = selectedDefensesIncrementIds.value.length;
  return `Delete defense${selectedDefensesCount > 1 ? "s" : ""}`;
});

function addDefense(): void {
  defenseSelectionModal.value?.show();
}

function deleteDefenses(): void {
  if (selectAll.value) {
    defenses.value = [];
  } else {
    selectedDefensesIncrementIds.value.forEach(defenseIncrementId => deleteDefense(defenseIncrementId));
  }

  if (defenseOverviewTable.value) defenseOverviewTable.value.allChecked = false;
  selectedDefenses.value = {};
}

function onDefenseSelection(defenseData: DefenseRootInterface): void {
  const incrementId = getNextDefenseIncrementId();
  defenses.value.push({
    incrementId,
    defenseData,
    userData: {
      incrementId,
      id: defenseData.id,
      isCollapsed: false,
      isUserDataCollapsed: false,
      label: defenseData.name,
      pet: new PetData,
      relic: new RelicData,
      shards: [],
      ascensionPoints: {},
    }
  });

  defenseSelectionModal.value?.hide();
}
</script>
