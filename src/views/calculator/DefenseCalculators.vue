<template>
  <div class="container">
    <Section section-title="Ancient power points">
      <AncientPowerPoints />
    </Section>

    <div class="table-view-toggle w-100 d-flex justify-content-end">
      <SwitchField
          v-model="tableView"
          label="Table view"
          rounded
      />
    </div>

    <Section section-title="Defense DPS calculator">
      <DefenseDpsCalculator />
    </Section>

    <Section section-title="Defense setups">
      <DefenseSetups />
    </Section>
  </div>
</template>

<script setup lang="ts">
import AncientPowerPoints from "@/components/sections/AncientPowerPoints.vue";
import DefenseDpsCalculator from "@/components/sections/DefenseDpsCalculator.vue";
import DefenseSetups from "@/components/sections/DefenseSetups.vue";
import Section from "@/components/layout/Section.vue";
import SwitchField from "@/components/layout/form/SwitchField.vue";

import { storeToRefs } from "pinia";
import { useUserDataStore } from "@/stores/UserData";

const { tableView } = storeToRefs(useUserDataStore());

</script>

<style scoped>

</style>