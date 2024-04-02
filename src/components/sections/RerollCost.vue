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
              <td>{{ calculateCost(2, 2500, 286) }}</td>
              <td>{{ calculateCost(2, 2500, 286) }}</td>
              <td>{{ calculateCost(2, 2750, 286) }}</td>
              <td>{{ calculateCost(2, 3500, 286) }}</td>
              <td>{{ calculateCost(5, 4500, 286) }}</td>
              <td>{{ calculateCost(5, 5000, 286) }}</td>
              <td>{{ calculateCost(5, 6000, 286) }}</td>
              <td>{{ calculateCost(3, 11000, 286) }}</td>
              <td>{{ calculateCost(4, 25000, 286) }}</td>
              <td>{{ calculateCost(5, 25000, 286) }}</td>
              <td>{{ calculateCost(5, 25000, 286) }}</td>
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

function calculateCost(
  amountOfMotes: number,
  goldCost: number,
  amountOfRerolls: number = 1
): string {
  const motePrice = rerollCost.value.moteCost / 99;
  const tokenPrice = rerollCost.value.tokenCost / 99;

  return Math.floor(
    (motePrice * amountOfMotes + tokenPrice + goldCost) * amountOfRerolls
  ).toLocaleString('en-US');
}
</script>
