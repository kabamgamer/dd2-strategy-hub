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
        <Defense :defense="defense" :collapsed="defense.userData?.isCollapsed" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Defense from "@/components/utilities/Defense/Defense.vue";

import { storeToRefs } from "pinia";

import type { UserDataStoreDefenseInterface } from "@/stores/UserData";
import { useUserDataStore } from "@/stores/UserData";

const userStore = useUserDataStore()
const { defenses } = storeToRefs(userStore);
const { getNextDefenseIncrementId } = userStore;

function addDefense(): void {
  defenses.value.push({incrementId: getNextDefenseIncrementId()} as UserDataStoreDefenseInterface);
}
</script>
