<template>
  <div class="card h-200">
    <div class="card-header">Mod reroll costs</div>
    <div class="card-body">
      <label for="moteCost">Mote cost (per stack):</label>
      <div class="reroll-mote__cost input-group mb-3" style="max-width: 125px">
        <input
          type="text"
          min="0"
          v-model="rerollCost.moteCost"
          name="moteCost"
          class="form-control"
          id="moteCost"
        />
      </div>
      <label for="tokenCost">Token cost (per stack):</label>
      <div class="reroll-token__cost input-group mb-3" style="max-width: 125px">
        <input
          type="number"
          min="0"
          v-model="rerollCost.tokenCost"
          name="tokenCost"
          class="form-control"
          id="tokenCost"
        />
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useUserDataStore } from "@/stores/UserData";

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
  ).toLocaleString();
}
</script>

<style scoped>
.btn-set .btn {
  margin-right: 5px;
}
</style>
