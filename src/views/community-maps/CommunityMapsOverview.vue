<template>
  <div class="container">
    <div class="action_toolbar d-flex justify-content-end">
      <button class="btn btn-primary" @click="$router.push({name: 'community-maps.detail', params: {id: 'new'}})">Share your layout</button>
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
import { ref } from "vue"

import Section from "@/components/layout/Section.vue";

import { useMapStore } from "@/stores/Map";
import ResourcePagination from "@/components/layout/ResourcePagination.vue";
import CommunityMapPreview from "@/components/utilities/CommunityMaps/CommunityMapPreview.vue";
import CommunityMapFilters from "@/components/utilities/CommunityMaps/CommunityMapFilters.vue";

const { getMapById } = useMapStore();

const additionalRequestParameters = ref({});

function onFilter(filters): void {
  additionalRequestParameters.value.filter = filters;
}

async function resolveMap(item: any): Promise<any> {
  item.map = await getMapById(item.map);

  return Promise.resolve(item)
}
</script>