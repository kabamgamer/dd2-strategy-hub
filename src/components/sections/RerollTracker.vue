<template>
  <div class="card h-100">
    <div class="card-header">Mod reroll tracker</div>
    <div class="card-body">
      <label for="rerollCounter">Reroll count:</label>
      <div class="reroll-trackers__tracker_count input-group mb-3" style="max-width: 125px">
        <input type="number" :max="pitySystemLimit" disabled :value="currentCount" name="rerollCounter" class="form-control" id="rerollCounter">
        <div class="input-group-append">
          <span class="input-group-text">/{{ pitySystemLimit }}</span>
        </div>
      </div>
      <div class="btn-set">
        <div style="padding: var(--bs-btn-padding-y) 40px" class="btn btn-primary" @click="addToCounter( 1)">+1</div>
        <div class="btn btn-info" @click="addToCounter(5)">+5</div>
        <div class="btn btn-info" @click="addToCounter(10)">+10</div>
        <div class="btn btn-warning" @click="addToCounter(-1)">-1</div>
        <div class="btn btn-danger" @click="addToCounter(-currentCount)">Reset</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const currentCount = ref(0);
const pitySystemLimit = ref(286);

function addToCounter(count: number): void {
  currentCount.value += count;
  localStorage.setItem('mod_reroll_tracker', currentCount.value.toString());
}

function initCounter(): void {
  const initialCount = localStorage.getItem('mod_reroll_tracker');
  currentCount.value = initialCount ? parseInt(initialCount) : 0;
}

onMounted(() => {
  initCounter();
});
</script>

<style scoped>
.btn-set .btn {
  margin-right: 5px;
}
</style>