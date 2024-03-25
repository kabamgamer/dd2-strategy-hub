<template>
  <div class="html-tooltip">
    <slot name="trigger"><IconQuestion width="20" height="20" /></slot>
    <span class="html-tooltip__text" :style="{ width: width + 'px', marginLeft: '-' + width/2 + 'px'}"><slot /></span>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

import IconQuestion from "@/components/icons/IconQuestion.vue";

defineProps({
  width: {
    type: Number,
    default: 200,
  },
});
</script>

<style lang="scss">
.tooltip__text {
  border-bottom: 1px dotted;
}

.html-tooltip {
  position: relative;
  display: inline-block;
  cursor: default;

  &__text {
    visibility: hidden;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    bottom: 150%;
    left: 50%;

    &::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: black transparent transparent transparent;
    }
  }

  &:hover &__text {
    visibility: visible;
  }

  &--critical-tooltip {
    .html-tooltip__text {
      &--non-critical {
        color: #ffae00;
      }

      &--critical {
        color: #dd0000;
      }
    }
  }
}
</style>