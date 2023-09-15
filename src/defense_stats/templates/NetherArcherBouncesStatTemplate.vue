<template>
  <span class="w-100 defense-info__header-stats__stat"><a href="#" @click.prevent="arrowBouncesModal?.show()">{{ stat.label }}</a></span>
  <BootstrapModal ref="arrowBouncesModal">
    <template #body>
      <table class="table table-striped">
        <thead>
        <tr>
          <th>Bounce #</th>
          <th>Damage</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(damage, bounce) in stat.value" :key="bounce">
          <td>{{ bounce }}</td>
          <td>{{ Math.round(damage).toLocaleString('en-US') }}</td>
        </tr>
        </tbody>
      </table>
    </template>
  </BootstrapModal>
</template>

<script setup lang="ts">
import { defineProps, ref } from "vue";
import type { PropType } from "vue";
import type { Modal } from "bootstrap";

import BootstrapModal from "@/components/layout/BootstrapModal.vue";

import type { DefenseStatInterface } from "@/interaces";

defineProps({
  stat: {
    type: Object as PropType<DefenseStatInterface>,
    required: true,
  },
})

const arrowBouncesModal = ref<Modal|null>(null)
</script>
