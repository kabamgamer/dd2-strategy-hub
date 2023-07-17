<template>
  <div class="reset-calculators mt-5 mb-5">
    <div class="row">
      <div class="reset-calculators__calculator col-md-4">
        <Card cardTitle="Minimum ascension calculator">
          <form id="minAscCalcForm" @submit.prevent="onSubmitMinAscCalcForm">
            <Input label="Max Onslaught Floor Reached Ever" type="number" :save-value-local="true"
                   v-model="maxFloorReached"/>
            <Input label="Max Ascension Level Reached ever" type="number" :save-value-local="true"
                   v-model="maxAscensionReached"/>

            <div v-if="minAscCalcFormMessage" class="mb-3">{{ minAscCalcFormMessage }}</div>

            <button type="submit" class="btn btn-primary">Calculate</button>
          </form>
        </Card>
      </div>

      <div class="reset-calculators__calculator col-md-8 mt-3 mt-md-0">
        <Card cardTitle="Chaos table">
          <div class="table-responsive">
            <table class="table table-bordered">
              <thead>
              <tr>
                <th scope="col">Chaos</th>
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
                <th scope="row">Gear score</th>
                <td>0</td>
                <td>580</td>
                <td>1050</td>
                <td>1740</td>
                <td>2750</td>
                <td>3800</td>
                <td>5300</td>
                <td>7850</td>
                <td>9850</td>
                <td>12750</td>
              </tr>

              <tr>
                <th scope="row">Onslaught floor</th>
                <td>3-4</td>
                <td>5-8</td>
                <td>9-11</td>
                <td>12-16</td>
                <td>17-21</td>
                <td>22-27</td>
                <td>28-98</td>
                <td>99-299</td>
                <td>300-699</td>
                <td>700*</td>
              </tr>
              </tbody>
            </table>
          </div>

          <i>* Chaos 10 is equal to floor 700, but there are no floor skips after chaos 9.</i>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from "@/components/layout/Card.vue";
import Input from "@/components/layout/form/Input.vue";

import { ref } from "vue";

const minAscCalcFormMessage = ref<string>('');
const maxFloorReached = ref<number>(0);
const maxAscensionReached = ref<number>(0);

function calculateMinAscension(maxFloorReached: number, maxAscensionReached: number): number {
  // ((Max Onslaught Floor Reached Ever - Original Target Onslaught Floor) x 4.16 + (Max Ascension Level Reached ever / 50) ) x 3
  return ((maxFloorReached - 30) * 4.16 + (maxAscensionReached / 50)) * 3;
}

function onSubmitMinAscCalcForm(): void {
  const minAscensionLvl = Math.round(calculateMinAscension(maxFloorReached.value, maxAscensionReached.value));

  if (minAscensionLvl < 0) {
    minAscCalcFormMessage.value = 'You have not reached the target floor yet.';
  } else {
    minAscCalcFormMessage.value = `Your minimum ascension level after resetting would be ${minAscensionLvl}`;
  }
}
</script>

<style scoped>
th[scope="col"] {
  min-width: 70px;
}
</style>