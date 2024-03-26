<template>
  <nav class="navbar navbar-expand-lg position-sticky top-0 navbar-dark bg-dark">
    <div class="container">
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-between" id="navbarText">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link" :active-class="'active'" :to="{name: 'home'}">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :active-class="'active'" :to="{name: 'calculator.defense'}">Defense DPS calculator</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :active-class="'active'" :to="{name: 'community-maps'}" :class="{active: $route.name === 'community-maps.detail'}">Community maps</router-link>
          </li>
        </ul>

        <ul class="navbar-nav mb-2 mb-lg-0">
          <li class="nav-item">
            <ImportExport />
          </li>
          <li class="nav-item">
            <AuthLoginModal ref="authLoginModal" with-cta />
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <main>
    <NotificationList class="container" />

    <router-view />
  </main>

  <footer class="footer mt-auto py-3 fixed-bottom bg-dark">
    <div class="container text-center">
      <span class="text-muted">
        Build: <ChangelogModal /> | &copy; {{ (new Date).getFullYear() }} DD2 Strategy Hub |
        <a href="https://github.com/kabamgamer/dd2-strategy-hub" target="_blank" rel="noopener noreferrer">
          <span class="icon-github"><IconGithub /></span> Github
        </a> |
        <a href="https://wiki.dungeondefenders2.com/wiki/Main_Page" class="external" target="_blank" rel="noopener">
          DD2 Wiki
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

import ImportExport from "@/components/utilities/ImportExport.vue";
import Modal from "@/components/layout/BootstrapModal.vue";
import IconGithub from "@/components/icons/IconGithub.vue";
import ChangelogModal from "@/components/utilities/ChangelogModal.vue";
import NotificationList from "@/components/utilities/NotificationList.vue";
import AuthLoginModal from "@/components/auth/AuthLoginModal.vue";

import { useDefenseStore } from "@/stores/DefenseInfo";
import { useModStore } from "@/stores/ModInfo";
import { useShardStore } from "@/stores/ShardInfo";
import { useGoogleSpreadsheetDataStore } from "@/stores/GoogleSpreadSheets";

const errorModal = ref<typeof Modal|null>(null);
const authLoginModal = ref<typeof AuthLoginModal|null>(null);
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

<style>
nav {
  z-index: 500;
}

nav.navbar {
  z-index: 600;
}

.btn-color-mode {
  margin-right: 10px;
}

body {
  padding-bottom: 60px;
}
body[data-bs-theme="dark"] .icon-github {
  color: #fff;
}
body[data-bs-theme="light"] .icon-github {
  color: #000;
}

footer {
  height: 60px;
}
</style>

<style src="@vueform/multiselect/themes/default.css"></style>
<style src="@vueup/vue-quill/dist/vue-quill.snow.css"></style>
<style>
.multiselect,
.multiselect .multiselect-dropdown {
  background: var(--bs-body-bg);
  color: var(--bs-body-color);
  border-color: var(--bs-border-color);
}
</style>