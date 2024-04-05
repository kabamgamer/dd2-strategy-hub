<template>
  <div :class="inFormGroup ? 'form-group' : ''" class="mb-3">
    <label v-if="label" :for="id">{{ label }}</label>
    <input :type="type" class="form-control" :id="id"
           :placeholder="placeholder ?? label" :step="step" :min="min" :max="max" v-model="value" @change="onchange">
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed, onMounted } from 'vue';

const props = defineProps({
  inFormGroup: {
    type: Boolean,
    default: true,
  },
  modelValue: [String, Number],
  saveValueLocal: Boolean,
  label: String,
  placeholder: String,
  type: {
    type: String,
    default: 'text',
  },
  step: String,
  min: String,
  max: String
});

const emits = defineEmits(['change', 'update:modelValue']);

const id = computed((): string => {
  // Camelize string
  return (props.label as string).replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase()
  }).replace(/\s+/g, '')
})

const value = computed({
  get(): any {
    return props.modelValue
  },
  set(newValue: any): void {
    emits('update:modelValue', newValue)
  },
})

function onchange(): void {
  emits('change', value.value)

  if (props.saveValueLocal) {
    localStorage.setItem(id.value, value.value as string)
  }
}

function loadInitialValue(): void {
  if (props.saveValueLocal) {
    value.value = localStorage.getItem(id.value) ?? '';
  }
}

onMounted((): void => {
  loadInitialValue()
})
</script>
