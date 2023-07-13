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
import { useUserDataStore } from "@/stores/UserData";

const { defenseSetups } = storeToRefs(useUserDataStore());

function addSetup(): void {
  // highest incrementId + 1
  const incrementId = Math.max(...defenseSetups.value.map((setup) => setup.incrementId), 0) + 1;
  defenseSetups.value.push({incrementId, label: "Setup " + incrementId, defensesIncrementIds: []} as UserDefenseSetupInterface);
}
</script>
