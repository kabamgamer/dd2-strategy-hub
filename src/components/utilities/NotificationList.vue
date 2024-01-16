<template>
  <div class="notification-list">
    <template v-for="notification in notifications" :key="notification.id">
      <BootstrapAlert v-if="notification.location === location && notification.type === 'alert'"
                      :type="notification.color"
                      :dismissible="notification.dismissible"
                      :duration="notification.duration"
                      @dismiss="removeNotification(notification)"
      >
        <span v-html="notification.message" />
      </BootstrapAlert>
    </template>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { storeToRefs } from "pinia";

import { useNotificationStore } from "@/stores/Notifications";

import BootstrapAlert from "@/components/layout/notify/BootstrapAlert.vue";

const notificationStore = useNotificationStore();

const { notifications } = storeToRefs(notificationStore)
const { removeNotification } = notificationStore

defineProps({
  location: {
    type: String,
    required: false,
  },
});
</script>

<style scoped>

</style>