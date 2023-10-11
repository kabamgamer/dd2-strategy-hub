<template>
  <Card card-title="Filters">
    <div class="row">
      <div class="col-md-4 mt-3">
        <div class="form-group">
          <label for="map">Map</label>
          <MapSelection v-model="selectedMap" @change="onMapSelect" />
        </div>
      </div>

      <div class="col-md-4 mt-3">
        <div class="form-group">
          <label for="map">Game Mode</label>
          <select class="form-select" v-model="filters.gameMode" @change="filters.difficulty = null">
            <option value="Adventures">Adventures</option>
            <option value="Expeditions">Expeditions</option>
            <option value="Survival">Survival</option>
            <option value="Mastery">Mastery</option>
            <option value="Incursion">Incursion</option>
          </select>
        </div>
      </div>

      <div class="col-md-4 mt-3">
        <div class="form-group">
          <label for="map">Difficulty</label>
          <select class="form-select" v-model="filters.difficulty" :disabled="!filters.gameMode">
            <option v-for="difficulty in gameModeDifficulties" :value="difficulty">{{ difficulty }}</option>
          </select>
        </div>
      </div>

      <div class="col-md-4 mt-3">
        <label for="map">Tags</label>
        <Multiselect
            v-model="filters.tags"
            mode="tags"
            :close-on-select="false"
            :options="['AFKable', 'Base heroes', 'No blockades', 'Petrify', 'Electrocute', 'Freeze', 'Shatter', 'Ignite']"
        />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, defineEmits, watch, computed } from "vue";

import Multiselect from '@vueform/multiselect'
import Card from "@/components/layout/Card.vue";
import MapSelection from "@/components/utilities/CommunityMaps/MapSelection.vue";
import MapData from "@/data/MapData";

const emit = defineEmits(["filter"]);

const selectedMap = ref()
const filters = ref({})

const gameModeDifficulties = computed(() => {
  switch (filters.value.gameMode) {
    case "Adventures":
      return ["Medium", "Hard"]
    case "Survival":
      return ["Wave 0-40", "Wave 41-50", "Wave 51-60", "Wave 61-70", "Wave 71-150", "Wave 151+"]
    default:
      return ["Chaos 1", "Chaos 2", "Chaos 3", "Chaos 4", "Chaos 5", "Chaos 6", "Chaos 7", "Chaos 8", "Chaos 9", "Chaos 10"]
  }
})

function onMapSelect(map: MapData) {
  filters.value.map = map.id;
}

watch(filters, () => {
  emit("filter", filters.value);
}, { deep: true })
</script>

<style scoped>

</style>
