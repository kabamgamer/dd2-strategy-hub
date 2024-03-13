<template>
  <HtmlTooltip :width="70" v-if="damageType && !damageType.equals(DamageType.NonLethal)">
    <template #trigger>
      <!-- Non-elemental -->
      <IconTypePhysical v-if="damageType.equals(DamageType.Physical)" />
      <IconTypeMagical v-if="damageType.equals(DamageType.Magical)" />

      <!-- Elemental -->
      <IconElementalEarth v-if="damageType.equals(DamageType.Earth)" />
      <IconElementalFire v-if="damageType.equals(DamageType.Fire)" />
      <IconElementalFrost v-if="damageType.equals(DamageType.Frost)" />
      <IconElementalPoison v-if="damageType.equals(DamageType.Poison)" />
      <IconElementalStorm v-if="damageType.equals(DamageType.Storm)" />
      <IconElementalWater v-if="damageType.equals(DamageType.Water)" />
    </template>

    {{ damageType.label }}
  </HtmlTooltip>
</template>

<script setup lang="ts">
import { computed, defineProps } from "vue";

import useDefenseDamageType from "@/composables/DefenseDamageType";

import type { PropType } from "vue";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";

import DamageType from "@/enums/DamageType";

import IconTypePhysical from "@/components/icons/damage_types/IconTypePhysical.vue";
import IconTypeMagical from "@/components/icons/damage_types/IconTypeMagical.vue";
import IconElementalEarth from "@/components/icons/damage_types/IconElementalEarth.vue";
import IconElementalFire from "@/components/icons/damage_types/IconElementalFire.vue";
import IconElementalFrost from "@/components/icons/damage_types/IconElementalFrost.vue";
import IconElementalPoison from "@/components/icons/damage_types/IconElementalPoison.vue";
import IconElementalStorm from "@/components/icons/damage_types/IconElementalStorm.vue";
import IconElementalWater from "@/components/icons/damage_types/IconElementalWater.vue";
import HtmlTooltip from "@/components/layout/HtmlTooltip.vue";

const { getDamageType } = useDefenseDamageType();

const props = defineProps({
  defense: Object as PropType<UserDataStoreDefenseInterface>,
});

const damageType = computed<undefined|DamageType>(() => {
  if (props.defense?.defenseData === undefined) return undefined;

  return getDamageType(props.defense as UserDataStoreDefenseInterface);
});
</script>

<style scoped>

</style>