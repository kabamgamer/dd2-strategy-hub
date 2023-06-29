<template>
  <div class="accordion-item mb-3">
    <h2 class="accordion-header" :id="id + '-heading'">
      <button class="accordion-button" type="button" data-bs-toggle="collapse" :data-bs-target="'#' + id" aria-expanded="true" :aria-controls="id">
        <span class="d-flex justify-content-between w-100">
          <span class="defense-label">{{ userDefense.label }}</span>

          <span class="defense-dps" v-if="defense?.baseDefensePower">{{ totalDps }}</span>
        </span>
      </button>
    </h2>

    <div :id="id" class="accordion-collapse collapse show" :aria-labelledby="id + '-heading'">
      <div class="accordion-body">
        <DefenseSelection v-if="!userDefense.label" v-model="defense" />

        <div class="defense-info" v-else>

          <div class="defense-info__header d-flex align-items-center flex-column">
            <div class="defense-info__header-info mb-3 w-100 d-flex">
              <div class="defense-info__header-icon">
                <img :src="defense?.icon" :alt="defense?.name">
              </div>
              <div class="defense-info__header-stats w-100">
                <span class="w-100 defense-info__header-stats__stat d-flex align-items-center">
                  <strong>Tier:</strong>
                  <div class="defense-info__level d-flex">
                    <button class="btn btn-link" @click="defenseLevel--" :disabled="defenseLevel===1"><IconChevronDown /></button>
                    <span class="defense-info__level-value">{{ defenseLevel }}</span>
                    <button class="btn btn-link" @click="defenseLevel++" :disabled="defenseLevel===5"><IconChevronUp /></button>
                  </div>
                </span>
                <span class="w-100 defense-info__header-stats__stat"><strong>Defense Power:</strong> {{ Math.round(defensePower) }}</span>
                <span class="w-100 defense-info__header-stats__stat"><strong>Defense Health:</strong> {{ Math.round(defenseHealth) }}</span>
                <span class="w-100 defense-info__header-stats__stat"><strong>Crit chance:</strong> {{ Math.round(criticalChance * 100) }}%</span>
                <span class="w-100 defense-info__header-stats__stat"><strong>Crit damage:</strong> {{ Math.round(criticalDamage * 100) }}%</span>
              </div>
            </div>

            <div class="defense-info__header-label">
              <input type="text" v-model="userDefense.label" />
            </div>
          </div>

          <hr />

          <div class="defense-info__pet">
            <div class="row">
              <div class="col-md-6">
                <Pet v-model="userDefense.pet" />
              </div>
              <div class="col-md-6">
                <DefenseRelic v-model="userDefense.relic" :defenseCompatibility="defense ?? undefined" :hide-mods="true" />
              </div>
            </div>
          </div>

          <hr />

          <div class="defense-info__relic">
            <DefenseRelic v-model="userDefense.relic" :defenseCompatibility="defense ?? undefined" :hide-relic="true" />
          </div>

          <hr />

          <div class="defense-info__shards">
            <Shards v-model="userDefense.shards" :defenseCompatibility="defense ?? undefined" />
          </div>

          <hr />

          <div class="defense-info__shards">
            <AscensionPoints v-model="userDefense.ascensionPoints" :ascensionPoints="defense?.ascensionPoints" />
          </div>

          <div class="actions d-flex justify-content-center">
            <button class="btn btn-danger" @click.prevent="$emit('delete')">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineEmits, defineProps, onMounted } from "vue";
import type { PropType } from "vue";
import type { DefenseRootInterface, UserDefenseInterface } from "@/interaces";

import DefenseSelection from "@/components/utilities/DefenseSelection.vue";
import Pet from "@/components/utilities/Pet.vue";
import DefenseRelic from "@/components/utilities/DefenseRelic.vue";
import Shards from "@/components/utilities/Shards.vue";
import AscensionPoints from "@/components/utilities/AscensionPoints.vue";
import IconChevronUp from "@/components/icons/IconChevronUp.vue";
import IconChevronDown from "@/components/icons/IconChevronDown.vue";

import PetData from "@/classes/Pet";
import RelicData from "@/classes/Relic";

import type DefenseModData from "@/data/DefenseModData";
import type DefenseShardData from "@/data/DefenseShardData";

import { useDefenseCalculations } from "@/composables/DefenseCalculations";
import { useDefenseStore } from "@/stores/DefenseInfo";
import { useModStore } from "@/stores/ModInfo"
import { useShardStore } from "@/stores/ShardInfo"

const { totalDps, defensePower, defenseHealth, criticalDamage, criticalChance, calculateDefensePower } = useDefenseCalculations()
const { getDefenseRoot } = useDefenseStore();
const { getModById } = useModStore()
const { getShardById } = useShardStore()

const emit = defineEmits(["change", "delete"]);
const props = defineProps({
  userDefenseProp: {
    type: Object as PropType<UserDefenseInterface>,
    required: false,
  },
  ancientResetPoints: {
    type: Object,
    required: true,
  },
});

const id = ref();
const defense = ref<DefenseRootInterface|null>(null);
const defenseLevel = ref(1);
const userDefense = ref<UserDefenseInterface>({
  incrementId: 1,
  id: "",
  label: "",
  pet: new PetData,
  relic: new RelicData,
  shards: [],
  ascensionPoints: {},
});

function recalculate(): void {
  const defenseMods: DefenseModData[] = []
  const defenseShards: DefenseShardData[] = []
  userDefense.value.relic.mods.forEach(async (modId: string): Promise<void> => {
    defenseMods.push(await getModById(modId))
  })
  userDefense.value.shards.forEach(async (shardId: string): Promise<void> => {
    defenseShards.push(await getShardById(shardId))
  })

  // Await the loading of mods and shards before calculating
  const interval: any = setInterval((): void => {
    if (defenseMods.length === userDefense.value.relic.mods.length && defenseShards.length === userDefense.value.shards.length) {
      clearInterval(interval)
      calculateDefensePower(defense.value, userDefense.value, defenseMods, defenseShards, defenseLevel.value, props.ancientResetPoints)
    }
  }, 100)
}

watch(defense, (val: DefenseRootInterface|null): void => {
  if (!val) return;
  if (userDefense.value.id === val.id) return;

  userDefense.value = {
    incrementId: userDefense.value.incrementId,
    id: val.id,
    label: val.name,
    pet: new PetData,
    relic: new RelicData,
    shards: [],
    ascensionPoints: {},
  };
}, {deep: true});

watch(userDefense, async (newValue: UserDefenseInterface, oldValue: UserDefenseInterface): Promise<void> => {
  // If the defense has changed, load new DefenseRoot data
  if (oldValue.id !== newValue.id) defense.value = await getDefenseRoot(newValue.id)

  emit("change", newValue)

  recalculate()
}, { deep: true })

watch(defenseLevel, recalculate)

watch(props.ancientResetPoints, recalculate, { deep: true })

onMounted((): void => {
  id.value = 'id' + Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
      .toLowerCase();

  if (props.userDefenseProp) userDefense.value = props.userDefenseProp
})
</script>

<style scoped>
.defense-info__header-icon {
  width: 60%;
  max-width: 150px;
  border: 1px solid grey;
}

.defense-info__header-icon img {
  width: 100%;
}

.defense-info__header-stats {
  margin-left: 5px;
  font-size: larger;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.defense-info__header-stats__stat {
  font-size: 12pt;
}

.defense-dps {
  margin-right: 5px
}
.defense-info__level .btn {
  padding: 0 3px;
  margin: 0;
}
.defense-info__level .btn svg {
  color: var(--bs-primary);
  width: 15px;
}

.accordion-button {
  font-weight: bold;
}
.accordion-button:focus {
  box-shadow: none;
}
</style>
