<template>
  <div class="pet">
    <h5>Pet</h5>
    <CustomInput placeholder="" type="number" label="Pet defense power" v-model="pet.defensePower" />
    <CustomInput placeholder="" type="number" label="Pet defense health" v-model="pet.defenseHealth" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from "vue";

import CustomInput from "@/components/layout/form/Input.vue";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const pet = ref(props.modelValue)
</script>
