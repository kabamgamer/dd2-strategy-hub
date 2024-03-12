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
    <td>{{ defense.userData.id === 'BuffBeam' ? 'N/A' : Math.round(defenseStats.defenseHitPoints).toLocaleString('en-US') }}</td>

    <!-- Defense Rate -->
    <td v-if="!isBuffDefense">{{ defenseStats.attackRate.toFixed(3).replace(/(\.[^0]*)0+$/, '$1').replace(/\.$/, '') }} ({{ defenseStats.attackRatePercentage }}%)</td>
    <td v-else>N/A</td>

    <!-- Defense Range -->
    <td>{{ defenseStats.defenseRange }}</td>

    <!-- Critical chance -->
    <td>{{ isBuffDefense ? 'N/A' : ((defenseStats.criticalChance * 100).toFixed(2) + '%') }}</td>

    <!-- Critical damage -->
    <td v-if="isBuffDefense">
      {{ (defenseStats.criticalDamage * 100 / 4).toFixed(2) }}%
      <HtmlTooltip>
        This is the critical damage bonus applied to other defenses
      </HtmlTooltip>
    </td>
    <td v-else>{{ (defenseStats.criticalDamage * 100).toFixed(2) }}%</td>

    <!-- Defense DPS -->
    <td colspan="2" v-if="isBuffDefense">
      {{ Math.round(defenseStats.defensePower / 10).toLocaleString('en-US') }}
      <HtmlTooltip>
        This is the defense power bonus applied to other defenses
      </HtmlTooltip>
    </td>
    <template v-else>
      <td>{{ isBuffDefense ? 'N/A' : Math.round(defenseStats.tooltipDps).toLocaleString('en-US') }}</td>
      <td>{{ isBuffDefense ? 'N/A' : Math.round(defenseStats.totalDps).toLocaleString('en-US') }}</td>
    </template>
  </tr>
</template>

<script setup lang="ts">
import { ref, defineProps } from "vue";

import type { PropType } from "vue";
import type { DefenseStatsInterface } from "@/types";

import HtmlTooltip from "@/components/layout/HtmlTooltip.vue";
import type {UserDataStoreDefenseInterface} from "@/stores/UserData";
import DefenseDamageTypeIcon from "@/components/utilities/Defense/DefenseDamageTypeIcon.vue";

defineProps({
  icon: String,
  label: String,
  allChecked: Boolean,
  inSetup: Boolean,
  isBuffDefense: Boolean,
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
</style>
