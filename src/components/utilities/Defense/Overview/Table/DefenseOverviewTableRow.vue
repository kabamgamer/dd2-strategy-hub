<template>
  <tr @click="$emit('defenseEdit')">
    <!-- Handle for sorting -->
    <td @click.stop><IconBars class="sorting-handle" /></td>

    <!-- Select for actions -->
    <td @click.stop><input type="checkbox" :checked="checked" @change="() => $emit('rowSelect', !checked)" /></td>

    <!-- Icon -->
    <td style="width: 50px"><img width="50" :src="icon" :alt="'Defense Icon ' + label"></td>

    <!-- Label -->
    <td>{{ label }}</td>

    <td v-for="tableHeader in tableHeaders" v-show="tableHeader.visible" :key="tableHeader.key">
      {{ statForHeader(tableHeader) }}

      <HtmlTooltip v-if="isBuffDefense && (tableHeader.key === 'criticalDamage' || tableHeader.key === 'tooltipDps')">
        This is the bonus applied to other defenses
      </HtmlTooltip>
    </td>

    <!-- Defense upgrade tier -->
    <td class="p-0" @click.stop>
      <div class="defense-info__level">
        <button class="btn btn-link btn--up" @click="$emit('defenseLevelUpdate', defenseLevel+1)" :disabled="defenseLevel===5"><IconChevronUp /></button>
        <span class="defense-info__level-value">{{ defenseLevel }}</span>
        <button class="btn btn-link btn--down" @click="$emit('defenseLevelUpdate', defenseLevel-1)" :disabled="defenseLevel===1"><IconChevronDown /></button>
      </div>
    </td>

    <!-- Damage type icon -->
    <td @click.stop style="width: 30px"><DefenseDamageTypeIcon :defense="defense" /></td>
  </tr>
</template>

<script setup lang="ts">
import { defineProps, toRef } from "vue";
import { storeToRefs } from "pinia";

import type { PropType } from "vue";
import type { DefenseStatsInterface } from "@/types";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";
import type { TableHeaderInterface } from "./DefenseOverviewTable.vue";

import { useUserDataStore } from "@/stores/UserData";

import HtmlTooltip from "@/components/layout/HtmlTooltip.vue";
import DefenseDamageTypeIcon from "@/components/utilities/Defense/DefenseDamageTypeIcon.vue";
import IconChevronDown from "@/components/icons/IconChevronDown.vue";
import IconChevronUp from "@/components/icons/IconChevronUp.vue";
import IconBars from "@/components/icons/IconBars.vue";

const props = defineProps({
  icon: String,
  label: String,
  inSetup: Boolean,
  isBuffDefense: Boolean,
  selected: Boolean,
  defenseLevel: {
    type: Number,
    required: true,
  },
  defenseStats: {
    type: Object as PropType<DefenseStatsInterface>,
    required: true,
  },
  defense: {
    type: Object as PropType<UserDataStoreDefenseInterface>,
    required: true,
  },
});

const { tableHeaders } = storeToRefs(useUserDataStore())
const checked = toRef(props, 'selected');

function statForHeader(tableHeader: TableHeaderInterface): string | number {
  let headerStat: number = (props.defenseStats as any)[tableHeader.key];
  
  if (props.defense.isBuffDefense) {
    switch (tableHeader.key) {
      case 'defenseHitPoints':
      case 'attackRate':
      case 'criticalChance':
        return 'N/A';
      case 'criticalDamage':
        return (headerStat / 4).toFixed(2) + '%';
      case 'tooltipDps':
        headerStat = props.defenseStats.defensePower / 10;
    }
  }

  switch (tableHeader.key) {
    case 'attackRate':
      return headerStat.toFixed(3).replace(/(\.[^0]*)0+$/, '$1').replace(/\.$/, '') + `(${props.defenseStats.attackRatePercentage}%)`
    case 'criticalChance':
    case 'criticalDamage':
      return headerStat.toFixed(2) + '%';
    case 'defenseHitPoints':
    case 'tooltipDps':
    case 'totalDps':
      return headerStat > 0 ? Math.round(headerStat).toLocaleString('en-US') : ''
    case 'defenseRange':
    default:
      return headerStat;
  }
}
</script>

<style lang="scss" scoped>
td {
  vertical-align: middle;
  font-size: 0.9rem;

  &:first-child {
    text-align: center;
  }

  &:not(:nth-child(-n + 2)) {
    cursor: pointer;
  }
}

.defense-info__level {
  display: flex;
  align-items: center;
  flex-direction: column;

  .btn {
    padding: 0;
    margin: 0;
    max-height: 15px;
    display: flex;

    svg {
      color: var(--bs-table-color);
      width: 18px;
      height: 13px;
    }
  }
}

.sorting-handle {
  cursor: pointer;
  height: 15px;
  margin-bottom: 4px;
}
</style>
