<template>
  <div class="map">
    <img :src="'/assets/maps/' + map" alt="Gates of Dragonfall">

    <slot name="defenses">
    </slot>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

defineProps({
  map: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.map img {
  width: 1080px;
  height: auto;
  object-fit: contain;
  object-position: top;
}
</style>