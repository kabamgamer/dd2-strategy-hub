<template>
  <div class="container">
    <h1>Dungeon Defenders 2 Strategy Hub</h1>
    <p>
      Welcome to the Dungeon Defenders 2 Strategy Hub! This site is a collection of tools and resources to help you plan your defenses and optimize your gear.
    </p>

    <p>
      On the <router-link :to="{ name: 'calculator.defense' }">Defense Calculator</router-link> page, you can create your defenses by selecting your mods and shards and you can
      theory craft until you find the best possible combination which works for you. Then you can even create a defense setup to see how multiple defenses work together.
      Here you can test your defenses in combination with your Boost Aura and Buff Beam, pylon shards and other possible buffs to see how they work together. Also here you can test 
      how your defenses work against different enemy types and Onslaught Mutators.
    </p>

    <p>
      Then there's also the <router-link :to="{ name: 'community-maps' }">Community Maps</router-link> page where you can find maps created by other players. You can also share your own maps.
      Discover new strategies and share your own with the community.
    </p>

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