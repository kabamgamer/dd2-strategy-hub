<template>
  <tr @click="$emit('defenseEdit')">
    <!-- Select for actions -->
    <td @click.stop><input type="checkbox" :checked="allChecked || checked" @change="({target}) => $emit('rowSelect', checked = (target as HTMLInputElement)?.checked)" /></td>

    <!-- Damage type icon -->
    <td @click.stop style="width: 30px"><DefenseDamageTypeIcon :defense="defense" /></td>

    <!-- Icon -->
    <td style="width: 50px"><img width="50" :src="icon" :alt="'Defense Icon ' + label"></td>

    <!-- Label -->
    <td>{{ label }}</td>

    <!-- Defense HP -->
    <td>{{ defense.isBuffDefense ? 'N/A' : Math.round(defenseStats.defenseHitPoints).toLocaleString('en-US') }}</td>

    <!-- Defense Rate -->
    <td v-if="!isBuffDefense">{{ defenseStats.attackRate.toFixed(3).replace(/(\.[^0]*)0+$/, '$1').replace(/\.$/, '') }} ({{ defenseStats.attackRatePercentage }}%)</td>
    <td v-else>N/A</td>

    <!-- Defense Range -->
    <td>{{ defenseStats.defenseRange }}</td>

    <!-- Critical chance -->
    <td>{{ isBuffDefense ? 'N/A' : (defenseStats.criticalChance.toFixed(2) + '%') }}</td>

    <!-- Critical damage -->
    <td v-if="isBuffDefense">
      {{ (defenseStats.criticalDamage / 4).toFixed(2) }}%
      <HtmlTooltip>
        This is the critical damage bonus applied to other defenses
      </HtmlTooltip>
    </td>
    <td v-else>{{ (defenseStats.criticalDamage).toFixed(2) }}%</td>

    <!-- Tooltip DPS -->
    <td v-if="isBuffDefense">
      {{ Math.round(defenseStats.defensePower / 10).toLocaleString('en-US') }}
      <HtmlTooltip>
        This is the defense power bonus applied to other defenses
      </HtmlTooltip>
    </td>
    <td v-else>{{ isBuffDefense ? 'N/A' : Math.round(defenseStats.tooltipDps).toLocaleString('en-US') }}</td>

    <!-- Actual DPS -->
    <td>{{ defenseStats.totalDps > 0 ? Math.round(defenseStats.totalDps).toLocaleString('en-US') : 'N/A' }}</td>

    <!-- Defense upgrade tier -->
    <td class="p-0" @click.stop>
      <div class="defense-info__level">
        <button class="btn btn-link btn--up" @click="$emit('defenseLevelUpdate', defenseLevel+1)" :disabled="defenseLevel===5"><IconChevronUp /></button>
        <span class="defense-info__level-value">{{ defenseLevel }}</span>
        <button class="btn btn-link btn--down" @click="$emit('defenseLevelUpdate', defenseLevel-1)" :disabled="defenseLevel===1"><IconChevronDown /></button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, defineProps } from "vue";

import type { PropType } from "vue";
import type { DefenseStatsInterface } from "@/types";

import HtmlTooltip from "@/components/layout/HtmlTooltip.vue";
import type {UserDataStoreDefenseInterface} from "@/stores/UserData";
import DefenseDamageTypeIcon from "@/components/utilities/Defense/DefenseDamageTypeIcon.vue";
import IconChevronDown from "@/components/icons/IconChevronDown.vue";
import IconChevronUp from "@/components/icons/IconChevronUp.vue";

defineProps({
  icon: String,
  label: String,
  allChecked: Boolean,
  inSetup: Boolean,
  isBuffDefense: Boolean,
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

const checked = ref<boolean>(false);
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
</style>
