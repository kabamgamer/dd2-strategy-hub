<template>
  <div class="container">
    <Section section-title="Ancient power resets">
      <AncientPowerResets />
    </Section>

    <Section section-title="Reroll tracker">
      <div class="row">
        <div class="col-md-6">
          <RerollTracker />
        </div>
      </div>
    </Section>
  </div>
</template>

<script setup lang="ts">
import AncientPowerResets from "@/components/sections/AncientPowerResets.vue";
import RerollTracker from "@/components/sections/RerollTracker.vue";
import Section from "@/components/layout/Section.vue";

</script>

<style scoped>

</style>