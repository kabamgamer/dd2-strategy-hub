<template>
  <div class="defense-user-info">
    <div class="defense-user-info__actions">
      <a class="defense-user-info__actions-action" @click.prevent="maxAllStats('medallion')">Max stats (medallion)</a>
      <a class="defense-user-info__actions-action" @click.prevent="maxAllStats('totem')">Max stats (totem)</a>
    </div>

    <div class="defense-user-info__pet">
      <div class="row">
        <div class="col-md-6">
          <DefenseRelic v-model="defense.userData.relic" :defenseCompatibility="defense.userData.id" :hide-mods="true" />
        </div>
        <div class="col-md-6">
          <Pet v-model="defense.userData.pet" />
        </div>
      </div>
    </div>

    <hr />

    <div class="defense-user-info__relic">
      <DefenseRelic v-model="defense.userData.relic" :defenseCompatibility="defense.userData.id" :hide-relic="true" />

      <!--    <i v-if="hasDiverseMods">For proper testing diverse mods, use defense setups (see section below)</i>-->
    </div>

    <hr />

    <div class="defense-user-info__shards">
      <Shards v-model="defense.userData.shards" :defenseCompatibility="defense.userData.id" />
    </div>

    <hr />

    <div class="defense-user-info__ascension">
      <AscensionPoints v-model="defense.userData.ascensionPoints" :ascensionPoints="defense.defenseData?.ascensionPoints" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, toRef } from "vue";

import type { PropType, ToRef } from "vue";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";

import { useGodlyStat } from "@/composables/GodlyStat";

import DefenseRelic from "@/components/utilities/Defense/Relic/DefenseRelic.vue";
import Pet from "@/components/utilities/Defense/Pet.vue";
import AscensionPoints from "@/components/utilities/AscensionPoints.vue";
import Shards from "@/components/utilities/Defense/Shards.vue";

const { getMaxStatForGodlyType } = useGodlyStat()

const props = defineProps({
  defense: {
    type: Object as PropType<UserDataStoreDefenseInterface>,
    required: true,
  },
});

const defense: ToRef<UserDataStoreDefenseInterface> = toRef(props, 'defense') as ToRef<UserDataStoreDefenseInterface>

function maxAllStats(type: string): void {
  let isMedallion = true
  if (type === 'totem') {
    isMedallion = false
  }

  defense.value.userData.pet = {
    defensePower: 18000,
    defenseHealth: 18000,
  }
  defense.value.userData.relic = {
    defensePower: isMedallion ? 110513 : 46419,
    defenseHealth: isMedallion ? 30946 : 73676,
    godlyStat: !defense.value.userData.relic.godlyStat ? undefined : {
      type: defense.value.userData.relic.godlyStat.type,
      value: getMaxStatForGodlyType(defense.value.userData.relic.godlyStat.type),
    },
    mods: defense.value.userData.relic.mods,
  }
}
</script>

<style lang="scss" scoped>
.defense-user-info {
  &__actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    &-action {
      cursor: pointer;
      font-size: 14px;
    }
  }
}
</style>