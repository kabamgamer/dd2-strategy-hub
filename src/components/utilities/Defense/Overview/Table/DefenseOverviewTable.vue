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
        <tr>
          <th scope="col"><input type="checkbox" :checked="allChecked" @change="checkAll" /></th>
          <th scope="col"></th>
          <th scope="col">Icon</th>
          <th scope="col">Label</th>
          <th scope="col">Hit Points</th>
          <th scope="col">Rate</th>
          <th scope="col">Range</th>
          <th scope="col">Crit. Chance</th>
          <th scope="col">Crit. Damage</th>
          <th scope="col">Tooltip DPS</th>
          <th scope="col">Actual DPS</th>
          <th scope="col" class="text-center">Tier #</th>
        </tr>
      </thead>
      <tbody>
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

import { useGoogleSpreadsheetDataStore } from "@/stores/GoogleSpreadSheets";

import type { ToRef } from "vue";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";

import Defense from "@/components/utilities/Defense/Defense.vue";
import LoadingSpinner from "@/components/layout/LoadingSpinner.vue";
import BootstrapModal from "@/components/layout/BootstrapModal.vue";
import DefenseUserInfo from "@/components/utilities/Defense/DefenseUserInfo.vue";

const { loading } = storeToRefs(useGoogleSpreadsheetDataStore())
const props = defineProps({
  defenses: Array,
  tableHover: Boolean,
});

const defenses: ToRef<UserDataStoreDefenseInterface[]> = toRef(props, 'defenses') as ToRef<UserDataStoreDefenseInterface[]>;

const emit = defineEmits(['totalDpsCalculated', 'deleteDefense']);

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
</style>
