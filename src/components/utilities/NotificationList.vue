<template>
  <div class="notification-list container">
    <div v-for="notification in notifications" :key="notification.id" class="notification">
      <BootstrapAlert v-if="notification.type === 'alert'"
                      :type="notification.color"
                      :dismissible="notification.dismissible"
                      @dismiss="removeNotification(notification)"
      >
        <span v-html="notification.message" />
      </BootstrapAlert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";

import { useNotificationStore } from "@/stores/Notifications";

import BootstrapAlert from "@/components/layout/notify/BootstrapAlert.vue";

const notificationStore = useNotificationStore();

const { notifications } = storeToRefs(notificationStore)
const { removeNotification } = notificationStore
</script>

<style scoped>

</style>