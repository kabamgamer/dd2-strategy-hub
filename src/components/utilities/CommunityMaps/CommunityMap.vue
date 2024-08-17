<template>
  <div class="map">
    <div class="zoomist-container">
      <div class="zoomist-wrapper">
        <div class="custom-zoomist-zoomer">
          <button class="custom-zoomer-button custom-zoomer-in">+</button>
          <div class="custom-zoomer-slider"></div>
          <button class="custom-zoomer-button custom-zoomer-out">-</button>
        </div>
        <div class="zoomist-image">
          <img :src="cdn('/media/maps/' + map.image)" :alt="map.name">

          <slot name="defenses">
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted } from "vue";
import Zoomist from 'zoomist'

import MapData from "@/data/MapData";

import useCdn from "@/composables/Cdn";

const { cdn } = useCdn();

onMounted(() => {
  new Zoomist('.zoomist-container', {
    maxScale: 4,
    slider: {
      el: '.custom-zoomer-slider',
      direction: 'vertical',
    },
    zoomer: {
      el: null,
      inEl: '.custom-zoomer-in',
      outEl: '.custom-zoomer-out',
      disabledClass: 'disabled',
      resetEl: null,
    }
    // slider: true,
    // zoomer: true
  })
})

defineProps({
  map: {
    type: MapData,
    required: true
  }
});
</script>

<style lang="scss" scoped>
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

.zoomist-wrapper {
  background: none;

  .custom-zoomist-zoomer {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    width: var(--zoomist-zoomer-button-size);
    right: 8px;
    top: 9px;
    z-index: 100;
    background-color: var(--zoomist-slider-bg-color);

    .custom-zoomer-button {
      width: 100%;
      height: var(--zoomist-zoomer-button-size);;
      background-color: var(--zoomist-zoomer-button-color);
      color: var(--zoomist-zoomer-icon-color);
      border: 0;

      &.disabled {
        pointer-events: none;
        background-color: #d3d3d3;
      }
    }

    .custom-zoomer-slider {
      padding: 8px 0;
    }
  }
}
</style>