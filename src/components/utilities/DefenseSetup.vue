<template>
  <div class="setup">
    <div class="setup__toolbar d-flex justify-content-between mb-2">
      <h3>{{ defenseSetup.label }} <span v-if="defenses.length === 0">(Configure a defense first)</span></h3>

      <div class="setup__toolbar_actions">
        <button class="btn btn-danger delete-btn" @click.prevent="deleteDefenseSetup(defenseSetup.incrementId)">
          Delete
        </button>
        <button class="btn btn-primary add-btn" :class="{ disabled: defenses.length === 0 }" :disabled="defenses.length === 0" @click.prevent="addDefense">
          Add defense
        </button>
      </div>
    </div>

    <hr class="w-100" />

    <div class="row">
      <div class="col-md-4" v-for="defense in setupDefenses" :key="defense.incrementId">
        <Defense :defense="defense" :setupDefenses="setupDefenses">
          <template #defense-details>
            <div class="d-flex justify-content-center">
              <button class="btn btn-danger" @click.prevent="deleteDefense(defense.incrementId)">
                Delete
              </button>
            </div>
          </template>
        </Defense>
      </div>

      <div class="col-md-4" v-if="defenseSelect">
        <div class="accordion-item position-relative mb-3">
          <h2 class="accordion-header" :id="id + '-heading'">
            <button class="accordion-button" type="button">
              <span class="d-flex justify-content-between w-100"></span>
            </button>
          </h2>

          <div class="accordion-collapse collapse show">
            <div class="accordion-body">
              <select class="form-select" @change="selectDefense" v-model="selectedDefense">
                <option :value="0" selected>
                  Select a defense
                </option>
                <option v-for="defense in defenseSelection" :key="defense.incrementId" :value="defense.incrementId">
                  {{ defense.userData.label }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, defineProps, computed } from "vue"
import type { PropType } from "vue"

import { useUserDataStore } from "@/stores/UserData"
import { storeToRefs } from "pinia"
import type { UserDefenseSetupInterface } from "@/interaces";
import Defense from "@/components/utilities/Defense.vue";

const props = defineProps({
  defenseSetup: {
    type: Object as PropType<UserDefenseSetupInterface>,
    required: true,
  },
})

const userStore = useUserDataStore()

const { defenses } = storeToRefs(userStore)
const { deleteDefenseSetup } = userStore

const id = ref<string>()
const defenseSelect = ref<boolean>(false)
const selectedDefense = ref<number|null>(null)
const setupDefenses = computed(() => {
  return defenses.value.filter((defense) => props.defenseSetup.defensesIncrementIds.includes(defense.incrementId))
})
const defenseSelection = computed(() => {
  return defenses.value.filter((defense) => defense.userData && !props.defenseSetup.defensesIncrementIds.includes(defense.incrementId))
})

function addDefense(): void {
  defenseSelect.value = true
}

function deleteDefense(defenseIncrementId: number): void {
  props.defenseSetup.defensesIncrementIds.splice(props.defenseSetup.defensesIncrementIds.indexOf(defenseIncrementId), 1)
}

function selectDefense(): void {
  if (selectedDefense.value === null || selectedDefense.value === 0) {
    return
  }
  props.defenseSetup.defensesIncrementIds.push(selectedDefense.value)
  defenseSelect.value = false
  selectedDefense.value = null
}

onMounted((): void => {
  id.value = 'id' + Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
      .toLowerCase();
})
</script>

<style scoped>
  .add-btn {
    margin-left: 1rem;
  }

  .setup {
    position: relative;
  }

  .missing-defenses {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    background: #ffffff05;
  }
</style>
