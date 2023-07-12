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
      <AncientPowerPoints />
    </Section>

    <Section section-title="Defense DPS calculator">
      <DefenseDpsCalculator />
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
import { ref } from "vue";

import Modal from "@/components/layout/BootstrapModal.vue";
import Section from "@/components/layout/Section.vue";
import AncientPowerResets from "@/components/sections/AncientPowerResets.vue";
import AncientPowerPoints from "@/components/sections/AncientPowerPoints.vue";
import RerollTracker from "@/components/sections/RerollTracker.vue";
import DefenseDpsCalculator from "@/components/sections/DefenseDpsCalculator.vue";
import IconGithub from "@/components/icons/IconGithub.vue";

import { useDefenseStore } from "@/stores/DefenseInfo";
import { useModStore } from "@/stores/ModInfo";
import { useShardStore } from "@/stores/ShardInfo";
import { useGoogleSpreadsheetDataStore } from "@/stores/GoogleSpreadSheets";

const errorModal = ref<typeof Modal|null>(null);
const errorMessage = ref<string>("");

(window as { onDataError?: (err: Error) => void })["onDataError"] = (e: Error): void => {
  console.error(e);
  errorMessage.value = "Something went wrong while loading defense data, please reload the page. If the problem persists, please contact the developer.";
  errorModal.value?.show();
  throw e
};

// Load stores for faster initializations
useGoogleSpreadsheetDataStore()
useDefenseStore()
useModStore()
useShardStore()

function reloadPage(): void {
  window.location.reload();
}
</script>
