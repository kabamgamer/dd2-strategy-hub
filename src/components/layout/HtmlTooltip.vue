<template>
  <div class="html-tooltip">
    <slot name="trigger"><IconQuestion width="20" height="20" /></slot>
    <span class="html-tooltip__text"><slot /></span>
  </div>
</template>

<script setup lang="ts">
import IconQuestion from "@/components/icons/IconQuestion.vue";
</script>

<style lang="scss" scoped>
.html-tooltip {
  position: relative;
  display: inline-block;
  cursor: default;

  &__text {
    visibility: hidden;
    width: 200px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    bottom: 150%;
    left: 50%;
    margin-left: -100px;

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
}
</style>