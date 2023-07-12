<template>
  <div class="toolbar d-flex justify-content-between mb-3">
    <div class="text-muted">
      All shards are considered gilded and all mods are considered c8 10/10
    </div>

    <button class="btn btn-primary" @click="addDefense">Add defense</button>
  </div>

  <div class="accordion">
    <div class="row">
      <div v-for="defense in defenses" :key="defense.incrementId" class="col-md-4">
        <Defense :defense="defense" :ancientResetPoints="ancientResetPoints" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Defense from "@/components/utilities/Defense.vue";

import { storeToRefs } from "pinia";
import { defineProps } from "vue";

import type { UserDataStoreDefenseInterface } from "@/stores/UserData";
import { useUserDataStore } from "@/stores/UserData";

const { defenses } = storeToRefs(useUserDataStore());

defineProps({
  ancientResetPoints: {
    type: Object,
    required: true,
  },
})

function addDefense(): void {
  // highest incrementId + 1
  const incrementId = Math.max(...defenses.value.map((defense) => defense.incrementId), 0) + 1;
  defenses.value.push({incrementId} as UserDataStoreDefenseInterface);
}
</script>
