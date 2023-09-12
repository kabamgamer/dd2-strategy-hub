<template>
  <div class="searchable">
    <input ref="searchInputElement" type="text" class="form-select" :placeholder="placeholder" v-model="searchCriteria" @keydown="onKeyDown" @focusout="activeIndex = 0">
    <div v-if="!grouped" class="select-options">
      <span
          class="select-options__option"
          :class="{ 'bg-primary-subtle': modelValue === option || index === activeIndex }"
          v-for="(option, index) in criteriaResult"
          :key="index"
          :data-value="option"
          @mousedown="onOptionSelect(option)"
          v-html="searchCriteria.length > 0 ? labelWithBaldCriteria(option[labelAttr]) : option[labelAttr]"
          ref="searchResultInputElements"
      ></span>
    </div>

    <div v-else class="select-options">
      <div class="select-options__group" v-for="(group, groupTitle) in groupedResult" :key="groupTitle">
        <div class="select-options__group-title">{{ groupTitle.toString() }}</div>
        <span
            class="select-options__option"
            :class="{ 'bg-primary-subtle': modelValue === option || parseInt(index.toString()) === activeIndex }"
            v-for="(option, index) in group"
            :key="index"
            :data-value="option"
            @mousedown="onOptionSelect(option)"
            v-html="searchCriteria.length > 0 ? labelWithBaldCriteria(option[labelAttr]) : option[labelAttr]"
            ref="searchResultInputElements"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {},
  placeholder: {
    type: String,
    default: 'Select an option',
  },
  options: {
    type: Object,
    default: () => {},
  },
  labelAttr: {
    type: String,
    default: 'label',
  },
  grouped: Boolean,
});

const emit = defineEmits(['update:modelValue', 'change']);

const criteriaResult = computed((): any[]|{ [index: string]: any[] } => {
  if (searchCriteria.value === '') return props.options as any[];

  if (!props.grouped) {
    return Object.values(props.options.filter((option: any): boolean => {
      return option[props.labelAttr].toLowerCase().includes(searchCriteria.value.toLowerCase());
    }));
  }

  const mappedGroups: { [index: string]: any } = {};
  for (const index in props.options) {
    let mappedGroup = (props.options[index] as any[]).filter((option: any): boolean => {
      return option[props.labelAttr].toLowerCase().includes(searchCriteria.value.toLowerCase());
    });

    if (mappedGroup.length === 0) {
      continue
    }

    mappedGroups[index] = mappedGroup;
  }

  return mappedGroups;
});

const groupedResult = computed((): { [key: string]: any[] } => {
  const result = criteriaResult.value as { [key: string]: any[] }
  if (!props.grouped) return result;

  let incrementId = 0;
  const remappedResult: { [key: string]: any } = {}

  for (const index in result) {
    remappedResult[index] = {}
    for (const option of result[index]) {
      remappedResult[index][incrementId] = option
      incrementId++
    }
  }

  return remappedResult;
});

const activeIndex = ref<number>(0);
const searchCriteria = ref<string>('');
const searchInputElement = ref<HTMLInputElement>();
const searchResultInputElements = ref<HTMLInputElement[]>([]);

function onOptionSelect(option: any): void {
  emit('update:modelValue', option);
  emit('change', option);
}

function labelWithBaldCriteria(label: string): string {
  const index = label.toLowerCase().indexOf(searchCriteria.value.toLowerCase());
  const length = searchCriteria.value.length;

  return label.slice(0, index) + '<b>' + label.slice(index, index + length) + '</b>' + label.slice(index + length);
}

function selectNextItem(): void {
  if (activeIndex.value === searchResultInputElements.value.length - 1) {
    activeIndex.value = 0
  } else {
    activeIndex.value++
  }

  searchResultInputElements.value[activeIndex.value].scrollIntoView({
    block: 'nearest',
    inline: 'start',
  })
}

function selectPreviousItem(): void {
  if (activeIndex.value === 0) {
    activeIndex.value = searchResultInputElements.value.length - 1
  } else {
    activeIndex.value--
  }

  searchResultInputElements.value[activeIndex.value].scrollIntoView({
    block: 'nearest',
    inline: 'start',
  })
}

function onKeyDown(event: KeyboardEvent): void {
  let selectedValue;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault()
      selectNextItem()
      break;
    case "ArrowUp":
      event.preventDefault()
      selectPreviousItem()
      break;
    case "Enter":
      if (props.grouped) {
        for (const group of Object.values(groupedResult.value)) {
          if (group[activeIndex.value] !== undefined) {
            selectedValue = group[activeIndex.value]
            break
          }
        }
      } else {
        selectedValue = (criteriaResult.value as any[])[activeIndex.value]
      }
      onOptionSelect(selectedValue);
      break;
    case "Escape":
    case "Esc":
      activeIndex.value = 0
      searchCriteria.value = ""
      searchInputElement.value?.blur()
      break
    default:
      activeIndex.value = 0
  }
}
</script>

<style scoped>
.searchable {
  position: relative;
}

.searchable .select-options {
  display: none;
  list-style-type: none;
  background-color: var(--bs-body-bg);
  border-radius: 0 0 5px 5px;
  border: 1px solid var(--bs-border-color);
  border-top: none;
  max-height: 300px;
  margin: 0;
  overflow-y: scroll;
  overflow-x: hidden;
  padding: 0;
  position: absolute;
  width: 100%;
  z-index: 10;
}
.searchable .form-select:focus + .select-options,
.select-options__group {
  display: flex;
  flex-direction: column;
}

.searchable .select-options .select-options__option {
  padding: 2px 9px;
  border-bottom: 1px solid var(--bs-border-color);
  cursor: pointer;
}

.searchable .select-options .select-options__group .select-options__group-title {
  padding: 2px 7px;
  font-weight: 700;
  border-bottom: 1px solid var(--bs-border-color);
}

.searchable .select-options .select-options__group .select-options__option {
  padding: 2px 20px;
}

.searchable .select-options .select-options__option:hover {
  color: var(--bs-primary-text-emphasis);
  background-color: var(--bs-primary-bg-subtle);
}
</style>