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
              <th scope="col" v-for="chaosTier in getChaosTiers()" :key="chaosTier.title">{{ chaosTier.title }}</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in getRerollRows()" :key="row.title">
              <th scope="row">{{ row.title }}</th>
              <td scope="row" v-for="chaosTier in getChaosTiers()" :key="`per-${chaosTier.title}`">{{ calculateCost(chaosTier.moteAmount, chaosTier.goldAmount, row.rerollAmount) }}</td>
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

type ChaosTier = {
  title: string,
  moteAmount: number,
  goldAmount: number,
}

type RerollRow = {
  title: string,
  rerollAmount: number,
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

function getChaosTiers(): ChaosTier[] {
  return [
    { title: "Campaign", moteAmount: 2, goldAmount: 2500 },
    { title: "1", moteAmount: 2, goldAmount: 2500 },
    { title: "2", moteAmount: 2, goldAmount: 2750 },
    { title: "3", moteAmount: 2, goldAmount: 3500 },
    { title: "4", moteAmount: 5, goldAmount: 4500 },
    { title: "5", moteAmount: 5, goldAmount: 5000 }, 
    { title: "6", moteAmount: 5, goldAmount: 6000 },
    { title: "7", moteAmount: 3, goldAmount: 11000 },
    { title: "8", moteAmount: 4, goldAmount: 25000 },
    { title: "9", moteAmount: 5, goldAmount: 25000 },
    { title: "10", moteAmount: 5, goldAmount: 25000 }
  ]
}

function getRerollRows(): RerollRow[] {
  return [
    { title: "Cost per roll", rerollAmount: 1 },
    { title: "Cost per 286", rerollAmount: pitySystemLimit.value },
    { title: "Cost until pity", rerollAmount: pitySystemLimit.value - rerollTracker.value.currentCount }
  ]
}

function calculateCost(
  amountOfMotes: number = 0,
  goldCost: number = 0,
  amountOfRerolls: number = 1
): string {
  return Math.floor(
    ((rerollCost.value.moteCost * amountOfMotes) + rerollCost.value.tokenCost + goldCost) * amountOfRerolls
  ).toLocaleString('en-US');
}
</script>
