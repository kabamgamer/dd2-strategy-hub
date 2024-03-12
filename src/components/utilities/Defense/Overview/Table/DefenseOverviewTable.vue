<template>
  <div class="table-responsive-md">
    <table class="table table-striped table-sm position-relative" :class="{ 'table-hover': tableHover }">
      <LoadingSpinner v-if="loading" />
      <thead>
        <tr>
          <th scope="col"><input type="checkbox" :checked="allChecked" @change="checkAll" /></th>
          <th scope="col">Icon</th>
          <th scope="col">Label</th>
          <th scope="col">Hit Points</th>
          <th scope="col">Rate</th>
          <th scope="col">Range</th>
          <th scope="col">Crit. Chance</th>
          <th scope="col">Crit. Damage</th>
          <th scope="col">Tooltip DPS</th>
          <th scope="col">Actual DPS</th>
        </tr>
      </thead>
      <tbody>
        <Defense
            v-for="defense in defenses"
            :key="defense.incrementId"
            :all-checked="allChecked"
            :defense="defense"
            table-view
            @row-select="(checked: boolean) => $emit('rowSelect', defense.incrementId, checked)"
            @defense-edit="onDefenseEdit"
            @total-dps-calculated="() => $emit('totalDpsCalculated', ...arguments)"
        />
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
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { storeToRefs } from "pinia";

import { useGoogleSpreadsheetDataStore } from "@/stores/GoogleSpreadSheets";

import Defense from "@/components/utilities/Defense/Defense.vue";
import LoadingSpinner from "@/components/layout/LoadingSpinner.vue";
import BootstrapModal from "@/components/layout/BootstrapModal.vue";
import DefenseUserInfo from "@/components/utilities/Defense/DefenseUserInfo.vue";

const { loading } = storeToRefs(useGoogleSpreadsheetDataStore())
defineProps({
  defenses: Array,
  tableHover: Boolean,
});

const emit = defineEmits(['selectAll', 'rowSelect', 'totalDpsCalculated']);

const allChecked = ref(false);
const editDefense = ref();
const editDefenseModal = ref();

function checkAll() {
  allChecked.value = !allChecked.value;
  emit('selectAll', allChecked.value);
}

function onDefenseEdit(defense) {
  editDefense.value = defense;
  editDefenseModal.value.show();
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
</style>