<template>
  <button class="btn btn-outline-success ms-2" @click.prevent="openModal" v-if="withCta && !user?.accessToken">
    Login
  </button>

  <BootstrapModal
    ref="authLoginModal"
    title="Login">
    <template #body>
      <GoogleLogin @loginSuccess="closeModal" />
    </template>
  </BootstrapModal>
</template>

<script setup lang="ts">
import { ref, defineProps } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/User";

import BootstrapModal from "@/components/layout/BootstrapModal.vue";
import GoogleLogin from "@/components/auth/GoogleLogin.vue";

defineProps({
  withCta: Boolean,
});

const { user } = storeToRefs(useUserStore());
const authLoginModal = ref<typeof BootstrapModal|null>(null);

function openModal(): void {
  authLoginModal.value?.show();
}

function closeModal(): void {
  authLoginModal.value?.hide();
}

defineExpose({ promptLogin: openModal });
</script>

<style scoped>

</style>