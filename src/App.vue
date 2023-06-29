<template>
  <main class="container">
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

    <Section section-title="Ancient Power points">
      <AncientPowerPoints v-model="userAncientResetPoints" />
    </Section>

    <Section section-title="Defense DPS calculator">
      <DefenseDpsCalculator :ancientResetPoints="userAncientResetPoints" />
    </Section>
  </main>

  <footer class="footer mt-auto py-3 bg-light">
    <div class="container text-center">
      <span class="text-muted">
        &copy; {{ (new Date).getFullYear() }} DD2 Strategy Hub |
        <a href="https://github.com/kabamgamer/dd2-strategy-hub" target="_blank" rel="noopener noreferrer">
          <IconGithub /> Github
        </a>
      </span>
    </div>
  </footer>

  <Modal title="An error occurred" ref="errorModal">
    <template #body>{{ errorMessage }}</template>
    <template #footer>
      <button class="btn btn-primary" @click.prevent="reloadPage">Reload</button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

import Modal from "@/components/layout/BootstrapModal.vue";
import Section from "@/components/layout/Section.vue";
import AncientPowerResets from "@/components/sections/AncientPowerResets.vue";
import AncientPowerPoints from "@/components/sections/AncientPowerPoints.vue";
import RerollTracker from "@/components/sections/RerollTracker.vue";
import DefenseDpsCalculator from "@/components/sections/DefenseDpsCalculator.vue";
import IconGithub from "@/components/icons/IconGithub.vue";

import type { UserAncientResetPoints } from "@/data/AncientPowers";

import { useDefenseStore } from "@/stores/DefenseInfo";
import { useModStore } from "@/stores/ModInfo";
import { useShardStore } from "@/stores/ShardInfo";

const errorModal = ref<typeof Modal|null>(null);
const errorMessage = ref<string>("");

(window as { onDataError?: (err: Error) => void })["onDataError"] = (e: Error): void => {
  console.error(e);
  errorMessage.value = "Something went wrong while loading defense data, please reload the page. If the problem persists, please contact the developer.";
  errorModal.value?.show();
  throw e
};

// Load stores for faster initializations
useDefenseStore()
useModStore()
useShardStore()

const userAncientResetPoints = ref<UserAncientResetPoints>({
  ancient_ability_power: 0,
  ancient_heroic_power: 0,
  ancient_health: 0,
  ancient_resistance: 0,
  ancient_life_steal: 0,
  ancient_fortification: 0,
  ancient_destruction: 0,
  ancient_strikes: 0,
  ancient_builder: 0,
  ancient_respawn: 0,
  ancient_defense_critical_damage: 0,
  ancient_defense_critical_chance: 0,
  ancient_hero_critical_damage: 0,
  ancient_hero_critical_chance: 0,
});

function reloadPage(): void {
  window.location.reload();
}

onMounted((): void => {
  userAncientResetPoints.value = JSON.parse(localStorage.getItem('ancientResetPoints') ?? '{}') as UserAncientResetPoints;
});

watch(userAncientResetPoints, (newValue: object): void => {
  localStorage.setItem('ancientResetPoints', JSON.stringify(newValue))
}, { deep: true });
</script>
