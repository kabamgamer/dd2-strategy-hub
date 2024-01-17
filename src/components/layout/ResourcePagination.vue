<template>
  <LoadingSpinner v-if="loading" />

  <div class="resource-pagination" v-else>
    <div class="resource-pagination__results" :class="wrapperClasses">
      <template v-if="result?.data?.length">
        <slot name="item" v-for="item in result.data" :item="item" :key="item.id"></slot>
      </template>
      <slot name="noResults" v-else>No results found</slot>
    </div>

    <nav class="resource-pagination__paginator">
      <ul class="pagination">
        <li class="page-item" :class="{ 'disabled': currentPage === 1 }">
          <a class="page-link" @click.prevent="changePage(currentPage - 1)" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        <li class="page-item" v-for="page in visiblePages" :key="page" :class="{ 'active': page === currentPage, 'disabled': page === '...' }">
          <a class="page-link" @click.prevent="changePage(page)" href="#">{{ page }}</a>
        </li>
        <li class="page-item" :class="{ 'disabled': currentPage === result.meta.last_page }">
          <a class="page-link" @click.prevent="changePage(currentPage + 1)" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineProps, watch } from "vue"
import type { PropType } from "vue"

import LoadingSpinner from "@/components/layout/LoadingSpinner.vue";

import useApi from "@/api/Api";

const { getFromEndpoint } = useApi();
const loading = ref(true);
const result = ref();
const currentPage = ref(1);
const fetchController = ref<AbortController>();
const visiblePages = computed(() => {
  const maxVisiblePages = 5;
  const halfVisiblePages = Math.floor(maxVisiblePages / 2);

  let startPage = Math.max(1, currentPage.value - halfVisiblePages);
  let endPage = Math.min(result.value.meta?.last_page, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = [];
  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) {
      pages.push('...');
    }
  }

  for (let page = startPage; page <= endPage; page++) {
    pages.push(page);
  }

  if (endPage < result.value.meta?.last_page) {
    if (endPage < result.value.meta?.last_page - 1) {
      pages.push('...');
    }
    pages.push(result.value.meta?.last_page);
  }

  return pages;
});

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

function changePage(pageNumber: number|string): void {
  if (currentPage.value === pageNumber) return;

  if (typeof pageNumber === 'string') return;

  currentPage.value = pageNumber;
  fetchResult();
}

async function fetchResult(): Promise<void> {
  loading.value = true;

  if (fetchController.value instanceof AbortController) {
    fetchController.value.abort();
  }

  fetchController.value = new AbortController();

  const endpoint: string = props.fetchEndpoint as string;
  const params: any = {
    limit: props.pageSize,
    page: currentPage.value,
  };

  result.value = await getFromEndpoint(
      endpoint + "?" + (new URLSearchParams(params).toString()) + formatQueryParams(props.additionalRequestParameters),
      {signal: fetchController.value?.signal}
  );

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

// Format eg {filter: {name: "test"}} to "filter[name]=test"
function formatQueryParams(params: any): string {
  let queryResult = "";

  for (let key in params) {
    if (typeof params[key] === "object") {
      for (let subKey in params[key]) {
        if (params[key][subKey] === "" || params[key][subKey] === null || params[key][subKey] === undefined) {
          continue;
        }
        // URL encode value
        const value = encodeURIComponent(params[key][subKey])
        queryResult += `&${key}[${subKey}]=${value}`;
      }
    } else if (params[key] === "" || params[key] === null || params[key] === undefined) {
      continue;
    } else {
      // URL encode value
      const value = encodeURIComponent(params[key])
      queryResult += `&${key}=${value}`;
    }
  }

  return queryResult;
}

watch(() => props.additionalRequestParameters, fetchResult, {deep: true});

onMounted(() => {
  fetchResult();
});
</script>

<style scoped>
.resource-pagination {
  display: flex;
  flex-direction: column;
}

.resource-pagination__paginator {
  display: flex;
  justify-content: center;
}
</style>