<template>
  <div class="switch-field">
    <label class="switch">
      <input type="checkbox" v-model="switchValue" @change="onChange" checked>
      <span class="slider" :class="{ rounded }"></span>
    </label>

    {{ label }}
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted } from "vue";

const switchValue = ref<boolean>();

const emit = defineEmits(['update:modelValue', 'change']);
const props = defineProps({
  modelValue: Boolean,
  label: String,
  rounded: {
    type: Boolean,
    default: false,
  },
});

function onChange(): void {
  emit('update:modelValue', switchValue.value);
  emit('change', switchValue.value);
}

onMounted(() => {
  switchValue.value = props.modelValue;
})
</script>

<style scoped>
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.rounded {
  border-radius: 24px !important;
}

.slider.rounded:before {
  border-radius: 50%;
}
</style>
