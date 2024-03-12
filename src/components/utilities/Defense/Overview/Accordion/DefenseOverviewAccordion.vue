<template>
  <div class="accordion">
    <div class="row">
      <slot name="defense-list" v-for="defense in defenses" :defense="defense" :key="defense.incrementId">
        <div class="col-md-4">
          <Defense :defense="defense" :collapsed="defense.userData?.isCollapsed" />
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

import type { PropType } from "vue";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";

import Defense from "@/components/utilities/Defense/Defense.vue";

defineProps({
  defenses: Array as PropType<UserDataStoreDefenseInterface[]>,
});
</script>
