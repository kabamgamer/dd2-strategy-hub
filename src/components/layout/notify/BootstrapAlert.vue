<template>
  <div class="alert" :class="[{ 'alert-dismissible': dismissible }, typeClass]" role="alert">
    <slot></slot>

    <button v-if="dismissible" type="button" class="btn-close" data-dismiss="alert" @click="$emit('dismiss')" aria-label="Close"></button>

    <div class="duration-indicator" :style="animationStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from "vue";

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
  duration: Number,
});

const typeClass = ref(`alert-${props.type}`);
const animationStyle = computed(() => {
  if (!props.duration) {
    return '';
  }

  const durationInSeconds = props.duration / 1000;
  return `animation: slide ${durationInSeconds}s linear infinite;`;
});
</script>

<style lang="scss">
@keyframes slide {
  0% { background-position: right; }
  100% { background-position: left; }
}

.alert {
  position: relative;

  .duration-indicator {
    background: linear-gradient(to right, var(--bs-alert-border-color) 50%, var(--bs-alert-bg) 50% 100%) right;
    background-size: 200%;
    width: 100%;
    height: 3px;
    position: absolute;
    bottom: 0;
    left: 0;
  }
}
</style>
