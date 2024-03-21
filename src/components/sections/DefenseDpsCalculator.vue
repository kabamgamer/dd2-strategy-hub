<template>
  <div class="toolbar d-flex justify-content-between mb-3">
    <div class="text-muted">
      All shards are considered gilded and all mods are considered c8 10/10
    </div>

    <div class="toolbar__actions">
      <button class="btn btn-primary" @click="addDefense">Add defense</button>
    </div>
  </div>

  <DefenseOverviewAccordion v-if="!tableView" :defenses="defenses" />
  <DefenseOverviewTable
      v-else
      ref="defenseOverviewTable"
      :defenses="defenses"
      table-hover
      @delete-defense="deleteDefense"
  />

  <BootstrapModal title="Select a defense" ref="defenseSelectionModal">
    <template #body>
      <DefenseSelection @change="onDefenseSelection" clear-on-select />
    </template>
  </BootstrapModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useUserDataStore } from "@/stores/UserData";

import type { DefenseRootInterface } from "@/types";
import PetData from "@/classes/Pet";
import RelicData from "@/classes/Relic";
import BootstrapModal from "@/components/layout/BootstrapModal.vue";
import DefenseSelection from "@/components/utilities/Defense/DefenseSelection.vue";
import DefenseOverviewTable from "@/components/utilities/Defense/Overview/Table/DefenseOverviewTable.vue";
import DefenseOverviewAccordion from "@/components/utilities/Defense/Overview/Accordion/DefenseOverviewAccordion.vue";
import UserDefense from "@/classes/UserDefense";

const userStore = useUserDataStore()
const { defenses, tableView } = storeToRefs(userStore);
const { getNextDefenseIncrementId, deleteDefense } = userStore;

const defenseOverviewTable = ref();
const defenseSelectionModal = ref<InstanceType<typeof BootstrapModal>>();

function addDefense(): void {
  defenseSelectionModal.value?.show();
}

function onDefenseSelection(defenseData: DefenseRootInterface): void {
  const incrementId = getNextDefenseIncrementId();
  defenses.value.push(new UserDefense({
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
    },
    userMods: [],
    userShards: [],
  }));

  defenseSelectionModal.value?.hide();
}
</script>
