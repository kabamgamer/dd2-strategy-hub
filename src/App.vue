<template>
  <nav class="navbar navbar-expand-lg position-sticky top-0" :class="'navbar-' + colorMode + ' bg-' + colorMode">
    <div class="container">
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-end" id="navbarText">
        <ul class="navbar-nav mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="btn btn-color-mode" :class="{ 'btn-outline-secondary': colorMode === 'dark', 'btn-outline-dark': colorMode === 'light'}" @click.prevent="toggleColorMode">
              <IconMoon v-if="colorMode === 'dark'" />
              <IconSun v-if="colorMode === 'light'" />
              {{ colorMode }} mode
            </a>
          </li>
          <li class="nav-item">
            <ImportExport />
          </li>
        </ul>
      </div>
    </div>
  </nav>

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

    <Section section-title="Defense setups">
      <DefenseSetups />
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
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";

import IconMoon from "@/components/icons/IconMoon.vue";
import IconSun from "@/components/icons/IconSun.vue";
import ImportExport from "@/components/utilities/ImportExport.vue";
import Modal from "@/components/layout/BootstrapModal.vue";
import Section from "@/components/layout/Section.vue";
import AncientPowerResets from "@/components/sections/AncientPowerResets.vue";
import AncientPowerPoints from "@/components/sections/AncientPowerPoints.vue";
import RerollTracker from "@/components/sections/RerollTracker.vue";
import DefenseDpsCalculator from "@/components/sections/DefenseDpsCalculator.vue";
import DefenseSetups from "@/components/sections/DefenseSetups.vue";
import IconGithub from "@/components/icons/IconGithub.vue";

import { useDefenseStore } from "@/stores/DefenseInfo";
import { useUserDataStore } from "@/stores/UserData";
import { useModStore } from "@/stores/ModInfo";
import { useShardStore } from "@/stores/ShardInfo";
import { useGoogleSpreadsheetDataStore } from "@/stores/GoogleSpreadSheets";

const { colorMode } = storeToRefs(useUserDataStore());
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

function toggleColorMode(): void {
  colorMode.value = colorMode.value === "light" ? "dark" : "light";
  document.body.dataset.bsTheme = colorMode.value;
}

function reloadPage(): void {
  window.location.reload();
}

onMounted(() => {
  document.body.dataset.bsTheme = colorMode.value;
});
</script>

<style>
nav {
  z-index: 500;
}

.btn-color-mode {
  margin-right: 10px;
}
</style>
