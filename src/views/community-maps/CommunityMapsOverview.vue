<template>
  <div class="container">
    <Section section-title="Filter maps">
      filter...
    </Section>

    <Section section-title="Results">
      <div class="row">
        <div class="col-md-3" v-for="i in 8" :key="i">
          <router-link :to="{name: 'community-maps.detail', params: {id: i}}">Result {{ i }}</router-link>
        </div>
      </div>
    </Section>
  </div>
</template>

<script setup lang="ts">
import Section from "@/components/layout/Section.vue";

</script>

<style scoped>

</style>