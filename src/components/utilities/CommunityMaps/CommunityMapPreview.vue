<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">{{ map.title }}</h5>
      <h6 class="card-subtitle mb-2 text-muted"><IconMap /> {{ (map.map as unknown as MapData).name }}</h6>
      <div class="card-body__thumbnail-wrapper">
        <img :src="cdn(map.thumbnail ?? '/media/maps/' + (map.map as unknown as MapData).image)" class="w-100">
        <DefenseList :map="map" />
      </div>
    </div>

    <div class="card-footer text-muted">
      <div class="d-flex flex-wrap map-meta">
        <div class="d-flex align-items-center ms-2 map-meta__item">
          <div class="map-meta__item-icon"><IconCalendar /></div>
          <span class="map-meta__item-value ms-2">{{ map.createdAt.toLocaleDateString() }}</span>
        </div>
        <div class="d-flex align-items-center ms-2 map-meta__item">
          <div class="map-meta__item-icon"><IconCaretUp /></div>
          <span class="map-meta__item-value ms-1">{{ map.votes.up }}</span>
        </div>
        <div class="d-flex align-items-center ms-1 map-meta__item">
          <div class="map-meta__item-icon"><IconCaretDown /></div>
          <span class="map-meta__item-value ms-1">{{ map.votes.down }}</span>
        </div>
        <div class="d-flex align-items-center ms-2 map-meta__item">
          <div class="map-meta__item-icon"><IconUser /></div>
          <span class="map-meta__item-value ms-2">{{ map.author.name }}</span>
        </div>
        <div class="d-flex align-items-center ms-2 map-meta__item">
          <div class="map-meta__item-icon"><IconGamepad /></div>
          <span class="map-meta__item-value ms-2">{{ map.gameMode }}</span>

          <div class="map-meta__item-icon ms-2"><IconFire /></div>
          <span class="map-meta__item-value ms-2">{{ map.difficulty }}</span>
        </div>
        <div class="d-flex align-items-center ms-2 map-meta__item">
          <div class="map-meta__item-icon"><IconTag /></div>
          <span class="map-meta__item-value ms-2">
            <span v-for="tag in map.tags.slice(0, 3)" :key="tag" class="badge bg-success me-1">{{ tag }}</span>
            <span v-if="map.tags.length > 3" >...</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue"

import IconCalendar from "@/components/icons/IconCalendar.vue"
import IconCaretUp from "@/components/icons/IconCaretUp.vue"
import IconCaretDown from "@/components/icons/IconCaretDown.vue"
import IconUser from "@/components/icons/IconUser.vue"
import IconTag from "@/components/icons/IconTag.vue"
import IconMap from "@/components/icons/IconMap.vue"
import IconGamepad from "@/components/icons/IconGamepad.vue"
import IconFire from "@/components/icons/IconFire.vue"
import DefenseList from "@/components/utilities/CommunityMaps/DefenseList.vue";

import useCdn from "@/composables/Cdn";

import type { PropType } from "vue"
import type { MapConfigInterface } from "@/interaces";
import type MapData from "@/data/MapData";

const { cdn } = useCdn();

defineProps({
  map: {
    type: Object as PropType<MapConfigInterface>,
    required: true,
  },
})
</script>

<style lang="scss" scoped>
.card {
  height: 100%;
}

.card-body__thumbnail-wrapper {
  position: relative;
  height: calc(100% - 40px);

  .defense-list {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 150px;
    overflow: auto;
    background-color: var(--bs-body-bg);
    opacity: 0;
    transform: translateY(100%);
    transition: transform 0.5s, opacity 0.5s, height 0.5s;
  }

  &:hover .defense-list {
    opacity: 1;
    height: 100%;
    transform: translateY(0);
  }
}

.card-footer {
  z-index: 50;
}
</style>