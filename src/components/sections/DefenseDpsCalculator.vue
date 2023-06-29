<template>
  <div class="toolbar d-flex justify-content-end mb-3">
    <button class="btn btn-primary" @click="addDefense">Add defense</button>
  </div>

  <div class="accordion">
    <div class="row">
      <div v-for="(userDefense, index) in userDefenses" :key="userDefense.incrementId" class="col-md-4">
        <Defense :userDefenseProp="userDefense" :ancientResetPoints="ancientResetPoints" @change="(updatedDefense) => onDefenseChange(index, updatedDefense)" @delete="userDefenses.splice(index, 1)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Defense from "@/components/utilities/Defense.vue";

import { onMounted, ref, watch, defineProps } from "vue";

import type { UserDefenseInterface } from "@/interaces";

const userDefenses = ref<UserDefenseInterface[]>([]);

defineProps({
  ancientResetPoints: {
    type: Object,
    required: true,
  },
})

onMounted((): void => {
  userDefenses.value = JSON.parse(localStorage.getItem('defenses') ?? '[]');
});

watch(userDefenses, (newValue): void => {
  localStorage.setItem('defenses', JSON.stringify(newValue))
}, { deep: true });

function addDefense(): void {
  // highest incrementId + 1
  const incrementId = Math.max(...userDefenses.value.map((userDefense) => userDefense.incrementId), 0) + 1;
  userDefenses.value.push({incrementId} as UserDefenseInterface);
}

function onDefenseChange(index: number, defense: UserDefenseInterface): void {
  userDefenses.value[index] = defense;
}
</script>
