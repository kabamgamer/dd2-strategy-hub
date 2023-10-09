<template>
  <div class="container-fluid">
    <Section section-title="Map X by Y">
      <div class="row">
        <div class="col-md-9">
          <CommunityMap>
            <template #defenses>
              <MapDefense />
            </template>
          </CommunityMap>
        </div>

        <div class="col-md-3">
          <Card cardTitle="Defenses">

          </Card>
        </div>
      </div>
    </Section>
  </div>
</template>

<script setup lang="ts">
import Section from "@/components/layout/Section.vue";
import CommunityMap from "@/components/utilities/CommunityMaps/CommunityMap.vue";
import Card from "@/components/layout/Card.vue";
import MapDefense from "@/components/utilities/CommunityMaps/Defense/MapDefense.vue";

</script>

<style scoped>

</style>
