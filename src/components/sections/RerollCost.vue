<template>
  <div class="card h-200">
    <div class="card-header">Costs</div>
    <div class="card-body">
      <div class="row">
        <div class="col-md-6 col-lg-3">
          <Input type="number" v-model="rerollCost.moteCostStack" @change="handleChange(ChangeTypes.StackMote)" step="100000" min="0" label="Mote cost (per stack)" />
        </div>
        <div class="col-md-6 col-lg-3">
          <Input type="number" v-model="rerollCost.tokenCostStack" @change="handleChange(ChangeTypes.StackToken)" step="100000" min="0" label="Token cost (per stack)" />
        </div>
      </div>
      <div class="row">
        <div class="col-md-6 col-lg-3">
          <Input type="number" v-model="rerollCost.moteCost" @change="handleChange(ChangeTypes.SingleMote)" step="5000" min="0" label="Mote cost" />
        </div>
        <div class="col-md-6 col-lg-3">
          <Input type="number" v-model="rerollCost.tokenCost" @change="handleChange(ChangeTypes.SingleToken)" step="5000" min="0" label="Token cost" />
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th scope="col">Chaos</th>
              <th scope="col">Campaign</th>
              <th scope="col">1</th>
              <th scope="col">2</th>
              <th scope="col">3</th>
              <th scope="col">4</th>
              <th scope="col">5</th>
              <th scope="col">6</th>
              <th scope="col">7</th>
              <th scope="col">8</th>
              <th scope="col">9</th>
              <th scope="col">10</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <th scope="row">Cost per roll</th>
              <td>{{ calculateCost(2, 2500) }}</td>
              <td>{{ calculateCost(2, 2500) }}</td>
              <td>{{ calculateCost(2, 2750) }}</td>
              <td>{{ calculateCost(2, 3500) }}</td>
              <td>{{ calculateCost(5, 4500) }}</td>
              <td>{{ calculateCost(5, 5000) }}</td>
              <td>{{ calculateCost(5, 6000) }}</td>
              <td>{{ calculateCost(3, 11000) }}</td>
              <td>{{ calculateCost(4, 25000) }}</td>
              <td>{{ calculateCost(5, 25000) }}</td>
              <td>{{ calculateCost(5, 25000) }}</td>
            </tr>
          </tbody>

          <tbody>
            <tr>
              <th scope="row">Cost per 286</th>
              <td>{{ calculateCost(2, 2500, pitySystemLimit) }}</td>
              <td>{{ calculateCost(2, 2500, pitySystemLimit) }}</td>
              <td>{{ calculateCost(2, 2750, pitySystemLimit) }}</td>
              <td>{{ calculateCost(2, 3500, pitySystemLimit) }}</td>
              <td>{{ calculateCost(5, 4500, pitySystemLimit) }}</td>
              <td>{{ calculateCost(5, 5000, pitySystemLimit) }}</td>
              <td>{{ calculateCost(5, 6000, pitySystemLimit) }}</td>
              <td>{{ calculateCost(3, 11000, pitySystemLimit) }}</td>
              <td>{{ calculateCost(4, 25000, pitySystemLimit) }}</td>
              <td>{{ calculateCost(5, 25000, pitySystemLimit) }}</td>
              <td>{{ calculateCost(5, 25000, pitySystemLimit) }}</td>
            </tr>
          </tbody>

          <tbody>
            <tr>
              <th scope="row">Cost until pity</th>
              <td>{{ calculateCost(2, 2500, pitySystemLimit - rerollTracker.currentCount) }}</td>
              <td>{{ calculateCost(2, 2500, pitySystemLimit - rerollTracker.currentCount) }}</td>
              <td>{{ calculateCost(2, 2750, pitySystemLimit - rerollTracker.currentCount) }}</td>
              <td>{{ calculateCost(2, 3500, pitySystemLimit - rerollTracker.currentCount) }}</td>
              <td>{{ calculateCost(5, 4500, pitySystemLimit - rerollTracker.currentCount) }}</td>
              <td>{{ calculateCost(5, 5000, pitySystemLimit - rerollTracker.currentCount) }}</td>
              <td>{{ calculateCost(5, 6000, pitySystemLimit - rerollTracker.currentCount) }}</td>
              <td>{{ calculateCost(3, 11000, pitySystemLimit - rerollTracker.currentCount) }}</td>
              <td>{{ calculateCost(4, 25000, pitySystemLimit - rerollTracker.currentCount) }}</td>
              <td>{{ calculateCost(5, 25000, pitySystemLimit - rerollTracker.currentCount) }}</td>
              <td>{{ calculateCost(5, 25000, pitySystemLimit - rerollTracker.currentCount) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="text-muted">* If you consider buying a mod and selling the tokens, keep in mind this will only give you a profit of 85% over token price due to Etherian Tax.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useUserDataStore } from "@/stores/UserData";
import Input from "@/components/layout/form/Input.vue";

export interface RerollCostInterface {
  moteCost: number;
  tokenCost: number;
  moteCostStack: number;
  tokenCostStack: number;
}

enum ChangeTypes {
  SingleMote = 'singleMote',
  SingleToken = 'singleToken',
  StackMote = 'stackMote',
  StackToken = 'stackTokens'
}

const { rerollCost, rerollTracker } = storeToRefs(useUserDataStore());
const pitySystemLimit = ref(286);

function handleChange(type: string): void {
  switch (type) {
  case ChangeTypes.SingleMote:
    rerollCost.value.moteCostStack = rerollCost.value.moteCost * 99
    break;
  case ChangeTypes.SingleToken:
    rerollCost.value.tokenCostStack = rerollCost.value.tokenCost * 99
    break;
  case ChangeTypes.StackMote:
    rerollCost.value.moteCost =  Math.floor(rerollCost.value.moteCostStack / 99)
    break;
  case ChangeTypes.StackToken:
    rerollCost.value.tokenCost =  Math.floor(rerollCost.value.tokenCostStack / 99)
    break;
  default:
    // Default case
    break;
}
}

function calculateCost(
  amountOfMotes: number,
  goldCost: number,
  amountOfRerolls: number = 1
): string {
  return Math.floor(
    (rerollCost.value.moteCost * amountOfMotes + rerollCost.value.tokenCost + goldCost) * amountOfRerolls
  ).toLocaleString('en-US');
}
</script>
