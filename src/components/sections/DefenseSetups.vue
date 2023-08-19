<template>
  <div class="toolbar d-flex justify-content-between mb-3">
    <div class="text-muted">
      Combine your defenses here to see how they perform as a setup.
    </div>

    <button class="btn btn-primary" @click="addSetup">Add setup</button>
  </div>

  <div class="accordion">
    <div v-for="defenseSetup in defenseSetups" :key="defenseSetup.incrementId">
      <DefenseSetup :defenseSetup="defenseSetup" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DefenseSetup from "@/components/utilities/DefenseSetup.vue";

import { storeToRefs } from "pinia";

import type { UserDefenseSetupInterface } from "@/interaces";
import { useUserDataStore, getDefaultSetupModifiers } from "@/stores/UserData";

const userStore = useUserDataStore()
const { defenseSetups } = storeToRefs(userStore);
const { getNextDefenseSetupIncrementId } = userStore;

function addSetup(): void {
  const incrementId = getNextDefenseSetupIncrementId();
  defenseSetups.value.push({incrementId, label: "Setup " + incrementId, defensesIncrementIds: [], modifiers: getDefaultSetupModifiers()} as UserDefenseSetupInterface);
}
</script>
