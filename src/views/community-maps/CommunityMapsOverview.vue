<template>
  <div class="container">
    <div class="action_toolbar d-flex justify-content-end">
      <button class="btn btn-primary" @click="onCreateNewMap">Share your layout</button>
    </div>
    <Section>
      <CommunityMapFilters @filter="onFilter" />
    </Section>

    <Section section-title="Results" class="position-relative">
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
import { useRoute, useRouter } from "vue-router"

import Section from "@/components/layout/Section.vue";

import { useMapStore } from "@/stores/Map";
import { useAcl } from "@/composables/Acl";
import ResourcePagination from "@/components/layout/ResourcePagination.vue";
import CommunityMapPreview from "@/components/utilities/CommunityMaps/CommunityMapPreview.vue";
import CommunityMapFilters from "@/components/utilities/CommunityMaps/CommunityMapFilters.vue";

const router = useRouter();
const { getMapById } = useMapStore();
const { canOrPromptLogin } = useAcl();

const additionalRequestParameters = ref({
  filter: getQueryFilters(),
  tags: null,
});

onUpdated(() => {
  additionalRequestParameters.value = {
    filter: {...additionalRequestParameters.value.filter, ...getQueryFilters()},
    tags: additionalRequestParameters.value.tags,
  };
});

function getQueryFilters(): any {
  const { query } = useRoute();
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
  filters.user_id = query.author || null;

  return filters;
}

function onCreateNewMap(): void {
  canOrPromptLogin('map.create').then(() => {
    router.push({name: 'community-maps.detail', params: {id: 'new'}})
  })
}

function onFilter(filters: {[key: string]: any}): void {
  const tags = filters.tags;
  if (tags) {
    delete filters.tags;
    additionalRequestParameters.value.tags = tags.join(',');
  }
  additionalRequestParameters.value.filter = filters;
}

async function resolveMap(item: any): Promise<any> {
  item.map = await getMapById(item.map);

  return Promise.resolve(item)
}
</script>