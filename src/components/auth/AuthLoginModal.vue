<template>
  <button class="btn btn-outline-success ms-2" @click.prevent="openModal" v-if="withCta && !user?.accessToken">
    Login
  </button>
  <div class="dropdown user-profile-dropdown" v-else>
    <button class="btn btn-primary ms-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
      <IconUser />
    </button>
    <ul class="dropdown-menu dropdown-menu-end">
      <li><a class="dropdown-item" href="#" @click.prevent="userProfileModal.openModal()">Profile</a></li>
      <li><router-link class="dropdown-item" :to="{name: 'community-maps', query: {author: user.id}, state: {author: user.id}}">Your maps</router-link></li>
      <li><a class="dropdown-item" href="#" @click.prevent="logout">Logout</a></li>
    </ul>
  </div>

  <UserProfileModal ref="userProfileModal" />

  <BootstrapModal
    ref="authLoginModal"
    title="Login">
    <template #body>
      <GoogleLogin @loginSuccess="onLoginSuccess" />
    </template>
  </BootstrapModal>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/User";

import useAuthorisationApi from "@/api/AuthorisationApi.ts";

import GoogleLogin from "@/components/auth/GoogleLogin.vue";
import UserProfileModal from "@/components/auth/UserProfileModal.vue";
import IconUser from "@/components/icons/IconUser.vue";
import BootstrapModal from "@/components/layout/BootstrapModal.vue";

defineProps({
  withCta: Boolean,
});

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const { loginUser } = userStore;
const authLoginModal = ref<typeof BootstrapModal|null>(null);
const userProfileModal = ref<typeof UserProfileModal|null>(null);

function onLoginSuccess(response): void {
  loginUser(response.user, response.access_token);
  closeModal()

  if (response.isNew) {
    userProfileModal.value?.openModal();
  }
}

function openModal(): void {
  authLoginModal.value?.show();
}

function closeModal(): void {
  authLoginModal.value?.hide();
}

function logout(): void {
  useAuthorisationApi().logout().then(() => {
    // window.location.reload();
    userStore.logoutUser();
  });
}

onMounted(() => {
  userStore.parseAuthModal(authLoginModal.value)
});

defineExpose({ promptLogin: openModal });
</script>

<style scoped>
.user-profile-dropdown .btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--bs-white);
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}
.user-profile-dropdown .btn svg {
  width: 1rem;
  height: 1rem;
}
</style>