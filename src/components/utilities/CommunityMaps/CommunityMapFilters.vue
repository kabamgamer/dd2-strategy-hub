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
            <option value="Adventure">Adventure</option>
            <option value="Expedition">Expedition</option>
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
            <option v-for="difficulty in gameModeDifficulties" :key="difficulty" :value="difficulty">{{ difficulty }}</option>
          </select>
        </div>
      </div>

      <div class="col-md-4 mt-3">
        <label for="map">Tags</label>
        <Multiselect
            v-model="filters.tags"
            mode="tags"
            :close-on-select="false"
            :options="tags"
        />
      </div>

      <div class="col-md-4 mt-3">
        <div class="form-group">
          <label for="map">Author</label>
          <input type="text" class="form-control" v-model="filters.author" />
        </div>
      </div>
    </div>

    <div class="active-filters">
      <div class="active-filters__filter badge bg-secondary me-2" v-if="Object.values(activeFilters).length > 1">
        Remove all filters <IconCross @click="removeAllFilters" />
      </div>
      <template v-for="(value, key) in activeFilters" :key="key">
        <template v-if="Array.isArray(value)">
          <div class="active-filters__filter badge bg-secondary me-2" v-for="(subValue, index) in value" :key="subValue">
            {{ key }}: {{ subValue }} <IconCross @click="filters[key].length > 1 ? filters[key].splice(index, 1) : filters[key] = null" />
          </div>
        </template>
        <div class="active-filters__filter badge bg-secondary me-2" v-else>
          {{ key }}: {{ value }} <IconCross @click="removeFilter(key)" />
        </div>
      </template>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, defineEmits, watch, computed, onMounted } from "vue";
import { useRoute } from "vue-router"

import { useDebounce } from "@/composables/Debounce";

import tags from "@/data/communityMapTags";

import Multiselect from '@vueform/multiselect'
import Card from "@/components/layout/Card.vue";
import MapSelection from "@/components/utilities/CommunityMaps/MapSelection.vue";
import IconCross from "@/components/icons/IconCross.vue";
import type MapData from "@/data/MapData";

const emit = defineEmits(["filter"]);

const route = useRoute();

const { debounce } = useDebounce();

const selectedMap = ref()
const filters = ref<{[key: string]: any}>({})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const activeFilters = computed(() => Object.fromEntries(Object.entries(filters.value).filter(([key, value]) => value !== null && value !== '')))

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

function onMapSelect(map?: MapData): void {
  if (!map) {
    filters.value.map = null
    return
  }

  filters.value.map = map.id
}

function removeAllFilters(): void {
  selectedMap.value = null;
  filters.value = {}
}

function removeFilter(filterKey: string|number): void {
  if (filterKey === 'map') {
    selectedMap.value = null;
  }

  filters.value[filterKey] = null;
}

function getQueryFilters(): any {
  const { query } = route;
  const filters: any = {};

  if (query.name) {
    filters.name = query.name;
  }
  if (query.difficulty) {
    filters.difficulty = query.difficulty;
  }
  if (query.gameMode) {
    filters.gameMode = query.gameMode;
  }
  if (query.map) {
    filters.map = query.map;
  }
  if (query.author) {
    filters.author = query.author;
  }

  return filters;
}

watch(() => route.query, () => (filters.value = getQueryFilters()), { deep: true })
watch(filters, debounce(() => emit("filter", filters.value), 600), { deep: true })

onMounted(() => {
    filters.value = getQueryFilters();
    emit("filter", filters.value);
})
</script>

<style scoped>

</style>
