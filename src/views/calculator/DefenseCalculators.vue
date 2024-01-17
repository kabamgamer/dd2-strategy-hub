<template>
  <div class="container">
    <Section section-title="Ancient power points">
      <AncientPowerPoints />
    </Section>

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

</script>

<style scoped>

</style>