<template>
  <div class="table__toolbar">
    <div class="table__toolbar-actions">
      <button class="btn btn-sm btn-danger" :disabled="deleteDefensesDisabled" @click.prevent="deleteDefenses">{{ deleteDefensesLabel }}</button>
    </div>
  </div>

  <div class="table-responsive-md">
    <table class="table table-striped table-sm position-relative" :class="{ 'table-hover': tableHover }">
      <LoadingSpinner v-if="loading" />
      <thead>
        <tr ref="tableHeaderWrapper">
          <th scope="col">
            <div class="dropdown">
              <IconElipsis class="btn--context-menu" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" />
              <ul class="dropdown-menu">
                <li v-for="availableTableHeader in availableTableHeaders" :key="availableTableHeader.key">
                  <span class="dropdown-item" @click.prevent="tableHeaders[availableTableHeader.key].visible = !tableHeaders[availableTableHeader.key].visible">
                    <IconCheck class="column-visibility-indicator column-visibility-indicator--visible" v-if="tableHeaders[availableTableHeader.key].visible" />
                    <IconCross class="column-visibility-indicator column-visibility-indicator--hidden" v-else />
                    {{ availableTableHeader.label }}
                  </span>
                </li>
              </ul>
            </div>
          </th>
          <th scope="col"><input type="checkbox" :checked="allChecked" @change="checkAll" /></th>
          <th scope="col">Icon</th>
          <th scope="col">Label</th>
          <th class="column--dragable" v-for="tableHeader in tableHeaders" v-show="tableHeader.visible" :key="tableHeader.key" scope="col">{{ tableHeader.label }}</th>
          <th scope="col" class="text-center">Tier #</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody ref="tableRowsWrapper">
        <slot name="defense-list" v-for="defense in defenses" :defense="defense" :allChecked="allChecked" :selectDefenseCallback="selectDefense" :key="defense.incrementId">
          <Defense
            :all-checked="allChecked"
            :defense="defense"
            table-view
            @row-select="selectDefense"
            @defense-edit="onDefenseEdit"
          />
        </slot>
      </tbody>
    </table>
  </div>

  <BootstrapModal title="Edit defense" ref="editDefenseModal">
    <template #body>
      <DefenseUserInfo v-if="editDefense" :defense="editDefense" />
    </template>
  </BootstrapModal>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits, onMounted, toRef } from "vue";
import { storeToRefs } from "pinia";
import { useDraggable } from 'vue-draggable-plus'

import { useGoogleSpreadsheetDataStore } from "@/stores/GoogleSpreadSheets";

import type { ToRef } from "vue";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";

import { useUserDataStore } from "@/stores/UserData";

import Defense from "@/components/utilities/Defense/Defense.vue";
import LoadingSpinner from "@/components/layout/LoadingSpinner.vue";
import BootstrapModal from "@/components/layout/BootstrapModal.vue";
import DefenseUserInfo from "@/components/utilities/Defense/DefenseUserInfo.vue";
import IconElipsis from '@/components/icons/IconElipsis.vue';
import IconCheck from '@/components/icons/IconCheck.vue';
import IconCross from '@/components/icons/IconCross.vue';

export interface TableHeaderInterface {
  label: string;
  key: string;
  visible: boolean;
}

const { loading } = storeToRefs(useGoogleSpreadsheetDataStore())
const props = defineProps({
  defenses: Array,
  tableHover: Boolean,
});

const defenses: ToRef<UserDataStoreDefenseInterface[]> = toRef(props, 'defenses') as ToRef<UserDataStoreDefenseInterface[]>;
const { tableHeaders } = storeToRefs(useUserDataStore())

const emit = defineEmits(['totalDpsCalculated', 'deleteDefense']);

const availableTableHeaders = ref<TableHeaderInterface[]>([
  { key: "defenseHitPoints", label: "Hit Points", visible: true },
  { key: "attackRate", label: "Rate", visible: true },
  { key: "defenseRange", label: "Range", visible: true },
  { key: "criticalChance", label: "Crit. Chance", visible: true },
  { key: "criticalDamage", label: "Crit. Damage", visible: true },
  { key: "tooltipDps", label: "Tooltip DPS", visible: true },
  { key: "totalDps", label: "Actual DPS", visible: true },
]);
const tableHeaderWrapper = ref();
const tableRowsWrapper = ref();

// TODO Fix a few reactivity issues with sorting header columns
/** @ts-ignore */
useDraggable(tableHeaderWrapper, tableHeaders, { animation: 150, draggable: '.column--dragable' })
/** @ts-ignore */
useDraggable(tableRowsWrapper, props.defenses, { animation: 150, handle: '.sorting-handle' })

const allChecked = ref<boolean>(false);
const editDefense = ref<UserDataStoreDefenseInterface>();
const editDefenseModal = ref();

const selectedDefenses = ref<number[]>([]);
const deleteDefensesDisabled = computed(() => !allChecked.value && selectedDefenses.value.length < 1);
const deleteDefensesLabel = computed(() => {
  if (allChecked.value) {
    return "Delete all defenses";
  }

  const selectedDefensesCount = selectedDefenses.value.length;
  return `Delete defense${selectedDefensesCount > 1 ? "s" : ""}`;
});

function deleteDefenses(): void {
  selectedDefenses.value.forEach((incrementId) => emit('deleteDefense', incrementId));

  allChecked.value = false;
  selectedDefenses.value = [];
}

function checkAll(): void {
  allChecked.value = !allChecked.value;

  if (allChecked.value) {
    selectedDefenses.value = defenses.value.map((defense) => defense.incrementId);
  } else {
    selectedDefenses.value = [];
  }
}

function onDefenseEdit(defense: UserDataStoreDefenseInterface): void {
  editDefense.value = defense;
  editDefenseModal.value.show();
}

function selectDefense(defenseIncrementId: number, selected: boolean): void {
  if (selected) {
    selectedDefenses.value.push(defenseIncrementId);
  } else {
    selectedDefenses.value = selectedDefenses.value.filter((id) => id !== defenseIncrementId);
  }
}

onMounted(() => {
  editDefenseModal.value._on('hidden.bs.modal', () => editDefense.value = undefined);
});

defineExpose({ allChecked });
</script>

<style lang="scss" scoped>
th {
  vertical-align: middle;
  position: sticky;
  top: 56px;

  &:first-child {
    text-align: center;
  }
}

.table__toolbar {
  &-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
  }
}

.column--dragable {
  cursor: move;
}
.btn--context-menu {
  cursor: pointer;
  height: 15px;
  margin-bottom: 5px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.column-visibility-indicator {
  height: 18px;
  margin-right: 5px;

  &--visible {
    color: #056905;
  }
  
  &--hidden {
    color: #921515;
  }
}
</style>
