<template>
  <a href="#" @click.prevent="openModal">{{ currentVersion }}</a>
  
  <Modal title="What's changed" ref="changelogModal" :is-large="true" @hide="lastVisitedVersion = currentVersion">
    <template #body>
      <LoadingSpinner v-if="isLoading" />

      <div class="version-history" v-else>
        <div class="version" v-for="version in versionInfo" :key="version.version">
          <div class="seen" v-if="version.version === lastVisitedVersion && lastVisitedVersion !== currentVersion">
            <span>You're up to date!</span>
          </div>

          <div class="version h1 mb-0">{{ version.version.substring(1) }}</div>
          <div class="date text-muted mb-2">{{ version.releaseDate }}</div>
          <div class="changelog" v-html="version.changeList"></div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useUserDataStore } from "@/stores/UserData"
import { useBuildInfoStore } from "@/stores/BuildInfo"
import semver from "semver";

import Modal from "@/components/layout/BootstrapModal.vue";
import LoadingSpinner from "@/components/layout/LoadingSpinner.vue";

const { lastVisitedVersion } = storeToRefs(useUserDataStore());
const { isLoading, currentVersion, versionInfo } = storeToRefs(useBuildInfoStore());
const changelogModal = ref<typeof Modal|null>(null);

function openModal(): void {
  changelogModal.value?.show();
}

onMounted(() => {
  const interval = setInterval((): void => {
    if (!isLoading.value) {
      clearInterval(interval)

      if (lastVisitedVersion.value !== 'v0.0.0' && semver.gt(currentVersion.value, lastVisitedVersion.value)) {
        openModal()
      }
    }
  }, 100)
});
</script>

<style scoped>
.seen {
  width: 100%;
  height: 18px;
  margin-bottom: 18px;
  border-bottom: 1px solid red;
  text-align: center;
}
.seen span {
  font-size: 20px;
  padding: 0 20px;
  background-color: var(--bs-body-bg);
}
</style>