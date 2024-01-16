<template>
  <div class="container">
    <div class="toolbar d-flex justify-content-between mb-3">
      <h1>My defenses</h1>

      <button class="btn btn-primary" @click="addDefense">Add defense</button>
    </div>

    <div class="text-muted mb-3">
      Be aware; these defenses are stored in your browser, not in your account.
      This means that if you currently use multiple devices, you will have to configure your defenses on each device.
      Also, if you are currently using a private/incognito window, your defenses will be lost when you close the window.
      This does not affect your map builds in any way.
    </div>

    <div v-if="!defenses.length">It looks empty here. You can start by configuring your first defense.</div>

    <div class="accordion">
      <div class="row">
        <div v-for="defense in defenses" :key="defense.incrementId" class="col-sm-6 col-lg-4 col-xl-3 my-3">
          <DefenseSelection v-if="!defense.userData" @change="(defenseData: DefenseRootInterface) => onDefenseSelection(defense, defenseData)" />
          <DefensePreview v-else :defense="defense.userData" @delete="onDefenseDelete(defense.incrementId)" edit-mode />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";

import type { UserDataStoreDefenseInterface } from "@/stores/UserData";
import { useUserDataStore } from "@/stores/UserData";
import DefensePreview from "@/components/utilities/Defense/DefensePreview.vue";
import DefenseSelection from "@/components/utilities/Defense/DefenseSelection.vue";
import type {DefenseRootInterface, UserDefenseInterface} from "@/interaces";
import PetData from "@/classes/Pet";
import RelicData from "@/classes/Relic";

const userStore = useUserDataStore()
const { defenses } = storeToRefs(userStore);
const { getNextDefenseIncrementId } = userStore;

function addDefense(): void {
  defenses.value.push({incrementId: getNextDefenseIncrementId()} as UserDataStoreDefenseInterface);
}

function onDefenseSelection(defense: any, defenseData: DefenseRootInterface): void {
  defense.defenseData = defenseData
  defense.userData = {
    incrementId: defense.incrementId,
    id: defenseData.id,
    isCollapsed: false,
    isUserDataCollapsed: false,
    label: defenseData.name,
    pet: new PetData,
    relic: new RelicData,
    shards: [],
    ascensionPoints: {},
  } as UserDefenseInterface;
}

function onDefenseDelete(defenseIncrementId: number): void {
  defenses.value = defenses.value.filter((defense: UserDataStoreDefenseInterface): boolean => {
    return defense.incrementId !== defenseIncrementId
  })
}
</script>

<style scoped>

</style>