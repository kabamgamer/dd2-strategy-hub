<template>
  <div class="card h-100">
    <div class="card-header">Tracker</div>
    <div class="card-body">
      <label for="rerollCounter">Reroll count:</label>
      <div class="reroll-trackers__tracker_count input-group mb-3" style="max-width: 135px">
        <input type="number" v-model="rerollTracker.currentCount" @change="ensureValidCount()" min="0" :max="pitySystemLimit" name="rerollCounter" class="form-control" id="rerollCounter"/>
        <div class="input-group-append">
          <span class="input-group-text">/{{ pitySystemLimit }}</span>
        </div>
      </div>
      <div class="btn-set">
        <div style="padding: var(--bs-btn-padding-y) 40px" class="btn btn-primary" @click="addToCounter(1)">+1</div>
        <div class="btn btn-info" @click="addToCounter(5)">+5</div>
        <div class="btn btn-info" @click="addToCounter(10)">+10</div>
        <div class="btn btn-warning" @click="addToCounter(-1)">-1</div>
        <div class="btn btn-danger" @click="addToCounter(-rerollTracker.currentCount)">Reset</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useUserDataStore } from "@/stores/UserData";

export interface RerollTrackerInterface {
  currentCount: number;
}

const { rerollTracker } = storeToRefs(useUserDataStore());
const pitySystemLimit = ref(286);

function addToCounter(count: number): void {
  rerollTracker.value.currentCount += count;
  ensureValidCount();
}

function ensureValidCount(): void {
  if (rerollTracker.value.currentCount > pitySystemLimit.value) {
    rerollTracker.value.currentCount = pitySystemLimit.value;
  } else if (rerollTracker.value.currentCount < 0) {
    rerollTracker.value.currentCount = 0;
  }
}
</script>

<style scoped>
.btn-set .btn {
  margin-right: 5px;
}
</style>