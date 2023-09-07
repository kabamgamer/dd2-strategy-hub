<template>
  <div class="relic">
    <div class="relic__specs" v-if="!hideRelic">
      <h5>Relic</h5>
      <Input type="number" label="Relic defense power" :placeholder="hideMods ? '' : undefined" v-model="modelValue.defensePower" />
      <Input type="number" label="Relic defense health" :placeholder="hideMods ? '' : undefined" v-model="modelValue.defenseHealth" />
      <div v-if="!modelValue.godlyStat?.type" class="form-group mb-3">
        <label>Relic godly stat</label>
        <select class="form-select" @change="onGodlyStatTypeSelect">
          <option>No godly stat</option>
          <option value="critical_damage">Critical damage</option>
          <option value="critical_chance">Critical chance</option>
          <option value="defense_range">Defense range</option>
          <option value="defense_resistance">Defense resistance</option>
        </select>
      </div>
      <div v-else class="d-flex align-items-center">
        <div class="form-group mb-3">
          <label class="d-flex justify-content-between align-items-center">{{ godlyStatLabel }} <Cross class="cross" @click="onDeleteGodlyStat" /></label>
          <input type="number" class="form-control" v-model="modelValue.godlyStat.value">
        </div>
      </div>
    </div>

    <div class="relic__mods" v-if="!hideMods">
      <h5>Mods</h5>
      <div class="relic__mods-slot bg-dark-subtle" v-for="(selection, index) in userSelection" :key="index">
        <div class="relic__mods-slot-content" v-if="!selection.mod">
          <div class="relic__mods-name">Mod #{{ index+1 }}</div>
          <div class="relic__mods-description">
            <ModSelection v-model="selection.mod" @change="onAddMod(index, selection.mod)" :defenseCompatibility="defenseCompatibility" />
          </div>
        </div>
        <div class="relic__mods-slot-content" v-else>
          <div class="relic__mods-name d-flex justify-content-between">
            <span>{{ selection.mod.name }}</span>

            <Cross class="cross" @click="onDeleteMod(index)" />
          </div>
          <div class="relic__mods-description">{{ selection.mod.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue"
import type { ModInterface, RelicInterface } from "@/interaces"

import Input from "@/components/layout/form/Input.vue"
import ModSelection from "@/components/utilities/ModSelection.vue"
import Cross from "@/components/icons/IconCross.vue"
import { onMounted, ref, computed } from "vue"

import { useModStore } from "@/stores/ModInfo"
const { getModById } = useModStore()

const props = defineProps({
  modelValue: {
    type: Object as PropType<RelicInterface>,
    required: true
  },
  defenseCompatibility: String,
  hideRelic: Boolean,
  hideMods: Boolean,
})

const godlyStatLabel = computed(() => {
  switch (props.modelValue.godlyStat?.type) {
    case 'critical_damage':
      return 'Critical damage'
    case 'critical_chance':
      return 'Critical chance'
    case 'defense_range':
      return 'Defense range'
    case 'defense_resistance':
      return 'Defense resistance'
    default:
      return 'Godly stat'
  }
})

const mods = props.modelValue?.mods ?? []
const userSelection = ref<{modId: string|null, mod: ModInterface|null}[]>([
  {modId: mods[0] ?? null, mod: null},
  {modId: mods[1] ?? null, mod: null},
  {modId: mods[2] ?? null, mod: null},
]);

function onAddMod(index: number, mod: ModInterface|null): void {
  if (!mod) return
  props.modelValue?.mods.push(mod.id);
}

function onDeleteMod(index: number): void {
  userSelection.value.splice(index, 1)
  userSelection.value[2] = {modId: null, mod: null}
  props.modelValue?.mods.splice(index, 1)
}

function onGodlyStatTypeSelect(event: Event): void {
  props.modelValue.godlyStat = {
    type: (event.target as HTMLInputElement).value,
    value: 0
  }
}

function onDeleteGodlyStat(): void {
  props.modelValue.godlyStat = undefined
}

onMounted((): void => {
  userSelection.value.forEach(async (selection) => {
    selection.mod = await getModById(selection.modId)
  })
})
</script>

<style scoped>
.relic__mods-slot {
  padding: 5px 10px;
  margin: 10px 0;
  border: 1px solid rgba(var(--bs-black-rgb), .2);
  border-radius: 10px;
}
.relic__mods-slot-content .relic__mods-name {
  font-weight: bold;
}

.cross {
  cursor: pointer;
}
</style>