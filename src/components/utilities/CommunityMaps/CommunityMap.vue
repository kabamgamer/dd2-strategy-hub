<template>
  <div class="map mb-3 mb-md-0" ref="mapElement">
    <div class="zoomist-container">
      <div class="zoomist-wrapper">
        <div class="custom-zoomist-zoomer">
          <button class="custom-zoomer-button custom-zoomer-in">+</button>
          <div class="custom-zoomer-slider"></div>
          <button class="custom-zoomer-button custom-zoomer-out">-</button>
        </div>
        <div class="zoomist-image" :style="{ height: mapHeight }">
          <div class="zoomist-image-wrapper" :style="{ transform: 'scale(' + (mapDimensions.width > 0 && mapDimensions.width < 1080 ? mapDimensions.width / 1080 : 1) + ')' }">
            <img :src="cdn('/media/maps/' + map.image)" :alt="map.name" ref="mapImgElement">

            <slot name="defenses">
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, onMounted } from "vue";
import Zoomist from 'zoomist'

import MapData from "@/data/MapData";

import useCdn from "@/composables/Cdn";
import { useElementDimensions } from "@/composables/Element/ElementDimensions";

const mapElement = ref<HTMLElement>();
const mapImgElement = ref<HTMLElement>();

const { cdn } = useCdn();
const { parseElementDimensions: parseMapDimensions, dimensions: mapDimensions } = useElementDimensions();
const { parseElementDimensions: parseMapImgDimensions, dimensions: mapImgDimensions } = useElementDimensions();

const mapHeight = computed(() => {
  return mapImgDimensions.height > 0 ? `${mapImgDimensions.height}px` : 'auto';
});

onMounted(() => {
  parseMapDimensions(mapElement.value);
  parseMapImgDimensions(mapImgElement.value);

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
  max-width: 1080px;
  height: auto;
}

.zoomist-wrapper {
  background: none;

  .zoomist-image-wrapper {
    transform-origin: top left;
  }

  .custom-zoomist-zoomer {
    @media (max-width: 768px) {
      --zoomist-slider-bg-color: rgba(255, 255, 255, 0);
      --zoomist-zoomer-button-size: 30px;
    }

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
      height: var(--zoomist-zoomer-button-size);
      background-color: var(--zoomist-zoomer-button-color);
      color: var(--zoomist-zoomer-icon-color);
      border: 0;

      &.disabled {
        pointer-events: none;
        background-color: rgba(255, 255, 255, 0);

        @media (max-width: 768px) {
          background-color: rgba(255, 255, 255, .5);
        }
      }
    }

    .custom-zoomer-slider {
      padding: 8px 0;
    }
  }
}
</style>