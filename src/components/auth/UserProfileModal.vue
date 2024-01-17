<template>
  <BootstrapModal
      ref="userProfileModal"
      title="Profile">
    <template #body>
      <Input v-model="userProfile.name" label="Nickname" />
    </template>

    <template #footer>
      <button class="btn btn-primary" @click="onSave">Save</button>
    </template>
  </BootstrapModal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";

import { useUserStore } from "@/stores/User";
import useAuthorisationApi from "@/api/AuthorisationApi";

import BootstrapModal from "@/components/layout/BootstrapModal.vue";
import Input from "@/components/layout/form/Input.vue";

const userStore = useUserStore();

const userProfileModal = ref<typeof BootstrapModal|null>(null);
const { user } = storeToRefs(userStore);
const { onUserUpdate } = userStore;
const { updateProfile } = useAuthorisationApi();

const userProfile = ref({
  name: user.value?.name,
});

function openModal(): void {
  userProfileModal.value?.show()
}

function onSave(): void {
  updateProfile(userProfile.value).then((response: {id: string, name: string}) => {
    userProfileModal.value?.hide();

    onUserUpdate(response);
  });
}

watch(user, () => {
  userProfile.value.name = user.value?.name;
}, { deep: true });

defineExpose({ openModal });
</script>

<style scoped>
</style>