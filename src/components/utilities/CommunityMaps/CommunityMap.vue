<template>
  <div class="map">
    <img :src="cdn('/media/maps/' + map.image)" :alt="map.name">

    <slot name="defenses">
    </slot>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

import MapData from "@/data/MapData";

import useCdn from "@/composables/Cdn";

const { cdn } = useCdn();

defineProps({
  map: {
    type: MapData,
    required: true
  }
});
</script>

<style scoped>
.map {
  position: relative;
}

.map img {
  object-fit: contain;
  object-position: top;
}

.map,
.map img {
  width: 1080px;
  height: auto;
}
</style>