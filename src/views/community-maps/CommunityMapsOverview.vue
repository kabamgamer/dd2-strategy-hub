<template>
  <div class="container">

    <div class="action_toolbar d-flex justify-content-between">
      <h1>Community maps</h1>

      <span><button class="btn btn-primary" @click="onCreateNewMap">Share your layout</button></span>
    </div>

    <p>
      Discover new strategies and share your own with the community. Struggle te beat a map? Find a way to beat it here. Have a great layout? Share it with the community.
    </p>

    <Section>
      <CommunityMapFilters @filter="onFilter" />
    </Section>

    <Section section-title="Results" class="position-relative">
      <template #title-row>
        <div class="resource__sorting d-flex align-items-center" style="gap: 5px">
          <span>Sort by:</span>

          <select v-model="sorting" @change="onSort" class="form-select form-select-sm" style="width: auto">
            <option value="votes">Most popular</option>
            <option value="created_at">Most recent</option>
          </select>
        </div>
      </template>

      <ResourcePagination fetch-endpoint="/maps" wrapper-classes="row" :page-size="12" :adapt-item="resolveMap" :additional-request-parameters="additionalRequestParameters">
        <template v-slot:item="{ item }">
          <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
            <router-link :to="{name: 'community-maps.detail', params: {id: item.id}}">
              <CommunityMapPreview :map="item" />
            </router-link>
          </div>
        </template>

        <template #noResults>
          <div class="col">
            No results found for current criteria
          </div>
        </template>
      </ResourcePagination>
    </Section>
  </div>
</template>

<script setup lang="ts">
import { ref, onUpdated } from "vue"
import { useRouter } from "vue-router"

import Section from "@/components/layout/Section.vue";

import { useMapStore } from "@/stores/Map";
import { useAcl } from "@/composables/Acl";
import ResourcePagination from "@/components/layout/ResourcePagination.vue";
import CommunityMapPreview from "@/components/utilities/CommunityMaps/CommunityMapPreview.vue";
import CommunityMapFilters from "@/components/utilities/CommunityMaps/CommunityMapFilters.vue";

const router = useRouter();
const sorting = ref('votes');
const { getMapById } = useMapStore();
const { canOrPromptLogin } = useAcl();

const additionalRequestParameters = ref({
  filter: {},
  tags: null,
  author: null,
  sortBy: sorting.value,
});

onUpdated(() => {
  additionalRequestParameters.value = {
    filter: additionalRequestParameters.value.filter,
    tags: additionalRequestParameters.value.tags,
    author: additionalRequestParameters.value.author,
    sortBy: additionalRequestParameters.value.sortBy,
  };
});

function onCreateNewMap(): void {
  canOrPromptLogin('map.create').then(() => {
    router.push({name: 'community-maps.detail', params: {id: 'new'}})
  })
}

function onFilter(persistantFilters: {[key: string]: any}): void {
  let filters = {...persistantFilters};
  const tags = filters.tags;
  const author = filters.author;

  delete filters.tags;
  delete filters.author;

  additionalRequestParameters.value.tags = tags ? tags.join(',') : null;
  additionalRequestParameters.value.author = author || null;
  additionalRequestParameters.value.filter = filters;
}

function onSort(): void {
  additionalRequestParameters.value.sortBy = sorting.value;
}

async function resolveMap(item: any): Promise<any> {
  item.map = await getMapById(item.map);

  return Promise.resolve(item)
}
</script>