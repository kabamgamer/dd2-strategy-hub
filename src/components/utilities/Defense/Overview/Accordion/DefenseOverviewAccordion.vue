<template>
  <div class="accordion">
    <div class="row">
      <div v-for="defense in defenses" :key="defense.incrementId" class="col-md-4">
        <Defense :defense="defense" :collapsed="defense.userData?.isCollapsed" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

import Defense from "@/components/utilities/Defense/Defense.vue";

defineProps({
  defenses: Array,
});
</script>
