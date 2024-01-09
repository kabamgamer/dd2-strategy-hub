<template>
  <div class="alert" :class="[{ 'alert-dismissible': dismissible }, typeClass]" role="alert">
    <slot></slot>

    <button v-if="dismissible" type="button" class="btn-close" data-dismiss="alert" @click="$emit('dismiss')" aria-label="Close"></button>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";

defineEmits(['dismiss']);

const props = defineProps({
  type: {
    type: String,
    default: 'primary',
  },
  dismissible: {
    type: Boolean,
    default: true,
  },
});

const typeClass = ref(`alert-${props.type}`);
</script>

<style scoped>

</style>