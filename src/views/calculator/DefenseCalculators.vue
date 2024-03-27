<template>
  <div class="container">
    <h1>Defense Calculators</h1>
    <p>
      With the defense calculator you can test how effective the effect of mods and shards are on your defenses. You can also test how your defenses work against different enemy types and Onslaught Mutators.
    </p>
    <p>
      Get started by creating a defense and configure the mods and shards you want to use. Then you can test your defenses in combination with your Boost Aura and Buff Beam, pylon shards and other possible buffs by 
      combining all defenses in a setup.
    </p>

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