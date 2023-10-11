<template>
  <LoadingSpinner v-if="loading" />

  <div class="pagination" :class="wrapperClasses" v-else>
    <template v-if="result?.items?.length">
      <slot name="item" v-for="item in result.items" :item="item" :key="item.id"></slot>
    </template>
    <slot name="noResults" v-else>No results found</slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, PropType, watch } from "vue"

import LoadingSpinner from "@/components/layout/LoadingSpinner.vue";

const loading = ref(true);
const result = ref();

const props = defineProps({
  wrapperClasses: {
    required: false,
  },
  fetchUrl: {
    type: String,
    required: true,
  },
  pageSize: {
    type: Number,
    default: 20,
  },
  filterResults: {
    type: Function as PropType<(result: any) => Promise<any>>,
    required: false,
  },
  additionalRequestParameters: {
    type: Object,
    required: false,
  },
});

async function fetchResult() {
  loading.value = true;

  const url: string = props.fetchUrl as string;

  result.value = {items: []};
  for (let i = 0; i < props.pageSize; i++) {
    result.value.items.push({
      id: i,
      title: "Beat gates with squire only",
      map: "dragonfall_town_gates_of_dragonfall",
      gameMode: "Survival",
      difficulty: "Wave 151+",
      tags: ["AFKable", "Base heroes"],
      votes: {up: 13, down: 3},
      author: {id: 1, name: "Kabamgamer"},
      createdAt: new Date(),
    });
  }

  if (props.filterResults) {
    result.value = await props.filterResults(result.value);
  }

  loading.value = false;
}

watch(() => props.additionalRequestParameters, fetchResult, {deep: true});

onMounted(() => {
  fetchResult();
});
</script>

<style scoped>

</style>