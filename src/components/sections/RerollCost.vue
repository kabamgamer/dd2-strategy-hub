<template>
  <div class="card h-200">
    <div class="card-header">Costs</div>
    <div class="card-body">
      <div class="row">
        <div class="col-md-6 col-lg-3">
          <Input type="number" v-model="rerollCost.moteCost" @change="handleChange(ChangeTypes.SingleMote)" step="5000" min="0" label="Mote cost" />
        </div>
        <div class="col-md-6 col-lg-3">
          <Input type="number" v-model="rerollCost.moteCostStack" @change="handleChange(ChangeTypes.StackMote)" step="100000" min="0" label="Mote cost (per stack)" />
        </div>
        <div class="col-md-6 col-lg-3">
          <Input type="number" v-model="rerollCost.tokenCost" @change="handleChange(ChangeTypes.SingleToken)" step="5000" min="0" label="Token cost" />
        </div>
        <div class="col-md-6 col-lg-3">
          <Input type="number" v-model="rerollCost.tokenCostStack" @change="handleChange(ChangeTypes.StackToken)" step="100000" min="0" label="Token cost (per stack)" />
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th scope="col">Chaos</th>
              <th scope="col">Campaign</th>
              <th scope="col" v-for="i in 10" :key="i">{{ i }}</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <th scope="row">Cost per roll</th>
              <td scope="row" v-for="calculateCosts in getCalculateCostForRerollCount(1)" :key="calculateCosts">{{ calculateCosts }}</td>
            </tr>
            
            <tr>
              <th scope="row">Cost per 286</th>
              <td scope="row" v-for="calculateCosts in getCalculateCostForRerollCount(pitySystemLimit)" :key="calculateCosts">{{ calculateCosts }}</td>
            </tr>
          </tbody>

          <tbody>
            <tr>
              <th scope="row">Cost until pity</th>
              <td scope="row" v-for="calculateCosts in getCalculateCostForRerollCount(pitySystemLimit - rerollTracker.currentCount)" :key="calculateCosts">{{ calculateCosts }}</td>
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
  SingleMote = "singleMote",
  SingleToken = "singleToken",
  StackMote = "stackMote",
  StackToken = "stackTokens",
}

const { rerollCost, rerollTracker } = storeToRefs(useUserDataStore());
const pitySystemLimit = ref(286);

function handleChange(type: string): void {
  switch (type) {
    case ChangeTypes.SingleMote:
      rerollCost.value.moteCostStack = rerollCost.value.moteCost * 99;
      break;
    case ChangeTypes.SingleToken:
      rerollCost.value.tokenCostStack = rerollCost.value.tokenCost * 99;
      break;
    case ChangeTypes.StackMote:
      rerollCost.value.moteCost = Math.floor(
        rerollCost.value.moteCostStack / 99
      );
      break;
    case ChangeTypes.StackToken:
      rerollCost.value.tokenCost = Math.floor(
        rerollCost.value.tokenCostStack / 99
      );
      break;
  }
}

function getCalculateCostForRerollCount(
  amountOfRerolls: number
): string[] {
  return [
    calculateCost(2, 2500, amountOfRerolls), // Campaign
    calculateCost(2, 2500, amountOfRerolls), // Chaos 1
    calculateCost(2, 2750, amountOfRerolls), // Chaos 2
    calculateCost(2, 3500, amountOfRerolls), // Chaos 3
    calculateCost(5, 4500, amountOfRerolls), // Chaos 4
    calculateCost(5, 5000, amountOfRerolls), // Chaos 5
    calculateCost(5, 6000, amountOfRerolls), // Chaos 6
    calculateCost(3, 11000, amountOfRerolls), // Chaos 7
    calculateCost(4, 25000, amountOfRerolls), // Chaos 8
    calculateCost(5, 25000, amountOfRerolls), // Chaos 9
    calculateCost(5, 25000, amountOfRerolls), // Chaos 10
  ]
}

function calculateCost(
  amountOfMotes: number = 1,
  goldCost: number = 1,
  amountOfRerolls: number = 1
): string {
  return Math.floor(
    ((rerollCost.value.moteCost ?? 0 * amountOfMotes) + rerollCost.value.tokenCost ?? 0 + goldCost) * amountOfRerolls
  ).toLocaleString('en-US');
}
</script>
