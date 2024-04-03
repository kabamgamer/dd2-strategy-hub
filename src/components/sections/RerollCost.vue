<template>
  <div class="card h-200">
    <div class="card-header">Mod reroll costs</div>
    <div class="card-body">
      <div class="row">
        <div class="col-md-6 col-lg-3">
          <Input v-model="rerollCost.moteCost" type="number" label="Mote cost (per stack)" />
        </div>
        <div class="col-md-6 col-lg-3">
          <Input v-model="rerollCost.tokenCost" type="number" label="Token cost (per stack)" />
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
              <td scope="row" v-for="calculateCosts in getCalculateCostForRerollCount(286)" :key="calculateCosts">{{ calculateCosts }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="text-muted">* If you consider buying a mod and selling the tokens, keep in mind this will only give you a profit of 85% over token price due to Etherian Tax.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useUserDataStore } from "@/stores/UserData";

import Input from "@/components/layout/form/Input.vue";

export interface RerollCostInterface {
  moteCost: number;
  tokenCost: number;
}

const { rerollCost } = storeToRefs(useUserDataStore());

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
  const motePrice = rerollCost.value.moteCost / 99;
  const tokenPrice = rerollCost.value.tokenCost / 99;

  return Math.floor(
    (motePrice * amountOfMotes + tokenPrice + goldCost) * amountOfRerolls
  ).toLocaleString('en-US');
}
</script>
