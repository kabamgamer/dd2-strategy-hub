<template>
  <div class="relic">
    <div class="relic__specs" v-if="!hideRelic">
      <h5>Relic</h5>
      <Input type="number" label="Relic defense power" :placeholder="hideMods ? '' : undefined" v-model="modelValue.defensePower" />
      <Input type="number" label="Relic defense health" :placeholder="hideMods ? '' : undefined" v-model="modelValue.defenseHealth" />
    </div>

    <div class="relic__mods" v-if="!hideMods">
      <h5>Mods</h5>
      <div class="relic__mods-slot" v-for="(selection, index) in userSelection" :key="index">
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
import { onMounted, ref } from "vue"

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

onMounted((): void => {
  userSelection.value.forEach(async (selection) => {
    selection.mod = await getModById(selection.modId)
  })
})
</script>

<style scoped>
.relic__mods-slot {
  background: lightgray;
  padding: 5px 10px;
  margin: 10px 0;
  border: 1px solid darkgray;
  border-radius: 10px;
}
.relic__mods-slot-content .relic__mods-name {
  font-weight: bold;
}

.cross {
  cursor: pointer;
}
</style>