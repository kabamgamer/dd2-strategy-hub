<template>
  <LoadingSpinner v-if="loading" />

  <div class="pagination" :class="wrapperClasses" v-else>
    <template v-if="result?.data?.length">
      <slot name="item" v-for="item in result.data" :item="item" :key="item.id"></slot>
    </template>
    <slot name="noResults" v-else>No results found</slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, PropType, watch } from "vue"

import LoadingSpinner from "@/components/layout/LoadingSpinner.vue";

import useApi from "@/api/Api";

const { getFromEndpoint } = useApi();
const loading = ref(true);
const result = ref();

const props = defineProps({
  wrapperClasses: {
    required: false,
  },
  fetchEndpoint: {
    type: String,
    required: true,
  },
  pageSize: {
    type: Number,
    default: 20,
  },
  adaptItem: {
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

  const endpoint: string = props.fetchEndpoint as string;

  result.value = await getFromEndpoint(endpoint);

  const adaptedData = []
  for (let item of result.value.data) {
    if (item.createdAt) {
      item.createdAt = new Date(item.createdAt);
    }

    if (item.updatedAt) {
      item.createdAt = new Date(item.createdAt);
    }

    if (props.adaptItem) {
      item = await props.adaptItem(item);
    }

    adaptedData.push(item);
  }
  result.value.data = adaptedData;

  loading.value = false;
}

watch(() => props.additionalRequestParameters, fetchResult, {deep: true});

onMounted(() => {
  fetchResult();
});
</script>

<style scoped>

</style>