<template>
  <div class="container-fluid">
    <LoadingSpinner v-if="loading" />

    <Section :section-title="mapConfigurations?.title" v-else>
      <div class="row" v-if="map">
        <div class="col-md-9">
          <CommunityMap :map="map" :key="communityMapKey">
            <template #defenses>
              <MapDefense :class="{hide: hideDefense[defensePosition.defenseIncrementId]}"
                          v-for="defensePosition in mapConfigurations.mapLayout"
                          :key="defensePosition.incrementId"
                          :editMode="editMode"
                          :icon="mapConfigurations.defenses[defensePosition.defenseIncrementId].mapIcon"
                          :position="defensePosition.position"
                          :rotation="defensePosition.rotationInDegrees"
                          @selectDefense="openDefenseAccordion(defensePosition.defenseIncrementId)"
                          @delete="deleteDefensePosition(defensePosition.incrementId)"
                          @update:position="(position) => defensePosition.position = position"
                          @update:rotation="(rotation) => defensePosition.rotationInDegrees = rotation"
              />
            </template>
          </CommunityMap>
        </div>

        <div class="col-md-3">
          <div class="map_actions d-flex justify-content-end">
            <div class="actions" v-if="!editMode">
              <button class="btn m-1 btn-primary" @click.prevent="editMode = true; communityMapKey++">Edit</button>
            </div>
            <div class="actions" v-else>
              <button class="btn m-1 btn-warning" @click.prevent="mapMetaConfigurationModal?.show()">Edit tags</button>
              <button class="btn m-1 btn-danger" @click.prevent="editMode = false; communityMapKey++">Cancel</button>
              <button class="btn m-1 btn-success" @click.prevent="onSave">Save</button>
            </div>
          </div>
          <Card class="mb-3" :cardTitle="map.name" :maxHeight="false">
            <strong>Map:</strong> {{ map.name }} <br />
            <strong>Author:</strong> {{ mapConfigurations.author?.name }} <br />
            <strong>Game mode:</strong> {{ mapConfigurations.gameMode }} <br />
            <strong>Difficulty:</strong> {{ mapConfigurations.difficulty }} <br />
            <strong>Tags:</strong> <span v-for="tag in mapConfigurations.tags" class="tag badge bg-success">{{ tag }}</span> <br />
            <strong>DU:</strong> {{ totalDu }}/{{ map.duLimit }} <br />
            <div class="votes d-flex align-items-center">
              <strong>Votes:</strong>
              <div class="votes__actions">
                <div class="vote" :class="{active: mapConfigurations.userVote === 'up'}" @click="vote('up')">
                  <IconCaretUp />
                  <span class="count">{{ mapConfigurations.votes?.up }}</span>
                </div>
                <div class="vote" :class="{active: mapConfigurations.userVote === 'down'}" @click="vote('down')">
                  <IconCaretDown />
                  <span class="count">{{ mapConfigurations.votes?.down }}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card cardTitle="Defenses" :maxHeight="false">
            <h2>Add defense</h2>
            <DefenseSelection v-if="editMode" @change="onDefenseSelection" />
            <hr />
            <div class="accordion accordion-flush" id="mapDefenseConfigurations">
              <div class="accordion-item" v-for="defense in mapConfigurations.defenses">
                <h2 class="accordion-header d-flex align-items-center" :id="'flush-heading' + defense.incrementId">
                  <div class="add-defense" @click="addDefensePosition(defense.incrementId)" v-if="editMode">+</div>
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="'#flush-collapse' + defense.incrementId">
                    {{ defense.label }}
                  </button>
                  <div class="hide-defense" @click="hideDefense[defense.incrementId] = !hideDefense[defense.incrementId]">
                    <IconEyeSlash v-if="hideDefense[defense.incrementId]" />
                    <IconEye v-else />
                  </div>
                </h2>
                <div :id="'flush-collapse' + defense.incrementId" class="accordion-collapse collapse" data-bs-parent="#mapDefenseConfigurations">
                  <DefensePreview :defense="defense" :editMode="editMode" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Section>

    <BootstrapModal ref="mapMetaConfigurationModal" title="Map settings">
      <template #body>
        <LoadingSpinner v-if="loading" />

        <div class="settings" v-else>
          <Input v-model="mapConfigurations.title" id="title" label="Title" />

          <div class="form-group mt-3" v-if="!mapConfigurations.map">
            <label for="map">Map</label>
            <MapSelection @change="onMapSelect" id="map" />
          </div>

          <div class="form-group mt-3">
            <label for="map">Game Mode</label>
            <select class="form-select" v-model="mapConfigurations.gameMode" @change="mapConfigurations.difficulty = null">
              <option value="Adventures">Adventures</option>
              <option value="Expeditions">Expeditions</option>
              <option value="Survival">Survival</option>
              <option value="Mastery">Mastery</option>
              <option value="Incursion">Incursion</option>
            </select>
          </div>

          <div class="form-group mt-3">
            <label for="map">Difficulty</label>
            <select class="form-select" v-model="mapConfigurations.difficulty" :disabled="!mapConfigurations.gameMode">
              <option v-for="difficulty in gameModeDifficulties" :value="difficulty">{{ difficulty }}</option>
            </select>
          </div>

          <div class="form-group mt-3">
            <label for="map">Tags</label>
            <Multiselect
                v-model="mapConfigurations.tags"
                mode="tags"
                :close-on-select="false"
                :options="['AFKable', 'Base heroes', 'No blockades', 'Petrify', 'Electrocute', 'Freeze', 'Shatter', 'Ignite']"
            />
          </div>
        </div>
      </template>
    </BootstrapModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from 'vue-router'
import { Collapse } from "bootstrap";
import { storeToRefs } from "pinia";

import Multiselect from '@vueform/multiselect'
import Section from "@/components/layout/Section.vue";
import CommunityMap from "@/components/utilities/CommunityMaps/CommunityMap.vue";
import Card from "@/components/layout/Card.vue";
import MapDefense from "@/components/utilities/CommunityMaps/Defense/MapDefense.vue";
import DefensePreview from "@/components/utilities/Defense/DefensePreview.vue";
import DefenseSelection from "@/components/utilities/Defense/DefenseSelection.vue";
import { DefenseRootInterface } from "@/interaces";
import LoadingSpinner from "@/components/layout/LoadingSpinner.vue";
import MapData from "@/data/MapData";

import { useMapStore } from "@/stores/Map";
import { useDefenseStore } from "@/stores/DefenseInfo";
import IconCaretUp from "@/components/icons/IconCaretUp.vue";
import IconCaretDown from "@/components/icons/IconCaretDown.vue";
import BootstrapModal from "@/components/layout/BootstrapModal.vue";
import MapSelection from "@/components/utilities/CommunityMaps/MapSelection.vue";
import Input from "@/components/layout/form/Input.vue";
import IconEye from "@/components/icons/IconEye.vue";
import IconEyeSlash from "@/components/icons/IconEyeSlash.vue";

const { getMapById } = useMapStore();
const { getDefenseRoot } = useDefenseStore();

const route = useRoute()
const editMode = ref<boolean>(route.params.id === "new")
const communityMapKey = ref<number>(0)
const totalDu = ref<number>(0)
const loading = ref(true)
const map = ref<MapData>()
const mapMetaConfigurationModal = ref<BootstrapModal>()
const mapConfigurations = ref({})
const hideDefense = ref({})
const gameModeDifficulties = computed(() => {
  switch (mapConfigurations.value.gameMode) {
    case "Adventures":
      return ["Medium", "Hard"]
    case "Survival":
      return ["Wave 0-40", "Wave 41-50", "Wave 51-60", "Wave 61-70", "Wave 71-150", "Wave 151+"]
    default:
      return ["Chaos 1", "Chaos 2", "Chaos 3", "Chaos 4", "Chaos 5", "Chaos 6", "Chaos 7", "Chaos 8", "Chaos 9", "Chaos 10"]
  }
})

function addDefensePosition(defenseIncrementId) {
  mapConfigurations.value.mapLayout = mapConfigurations.value.mapLayout || []
  mapConfigurations.value.mapLayout.push({
    incrementId: Math.max(...mapConfigurations.value.mapLayout.map((defense) => defense.incrementId), 0) + 1,
    defenseIncrementId: defenseIncrementId,
    rotationInDegrees: 0,
    position: {
      x: 600,
      y: 300,
    }
  })
}

function vote(userVote: string): void {
  if (mapConfigurations.value.userVote === userVote) {
    mapConfigurations.value.votes[mapConfigurations.value.userVote] -= 1
    mapConfigurations.value.userVote = null
  }

  if (mapConfigurations.value.userVote !== null) {
    mapConfigurations.value.votes[mapConfigurations.value.userVote] -= 1
  }

  mapConfigurations.value.votes[userVote] += 1

  mapConfigurations.value.userVote = userVote
}

function deleteDefensePosition(incrementId) {
  mapConfigurations.value.mapLayout = mapConfigurations.value.mapLayout.filter((defensePosition) => {
    return defensePosition.incrementId !== incrementId;
  })
}

function onMapSelect(selectedMap) {
  map.value = selectedMap
  mapConfigurations.value.map = selectedMap.id
}

function onSave() {
  editMode.value = false
  communityMapKey.value++
}

function onDefenseSelection(defenseData: DefenseRootInterface): void {
  mapConfigurations.value.defenses = mapConfigurations.value.defenses || {}
  const nextDefenseIncrementId = Math.max(...Object.values(mapConfigurations.value.defenses).map((defense) => defense.incrementId), 0) + 1;
  mapConfigurations.value.defenses[nextDefenseIncrementId] = {
    incrementId: nextDefenseIncrementId,
    id: defenseData.id,
    label: defenseData.name,
    mapIcon: defenseData.mapIcon,
    relic: {
      mods: []
    },
    shards: []
  }
}

function openDefenseAccordion(defenseIncrementId: string): void {
  const parent = document.getElementById('mapDefenseConfigurations')
  const defenseAccordionElement = document.getElementById('flush-collapse' + defenseIncrementId)
  new Collapse(defenseAccordionElement, {parent, toggle: false}).show();
}

async function loadMapConfigurations(): Promise<void> {
  if (route.params.id === 'new') {
    loading.value = false
    mapConfigurations.value = {
      author: {id: 1, name: 'Kabamgamer'},
      votes: {up: 0, down: 0},
    }
    mapMetaConfigurationModal.value?.show()
    return Promise.resolve()
  }

  loading.value = true

  mapConfigurations.value = {
    title: "Beat gates with squire only",
    map: "dragonfall_town_gates_of_dragonfall",
    gameMode: "Survival",
    difficulty: "Wave 151+",
    tags: ["AFKable", "Base heroes"],
    userVote: "up",
    votes: {up: 13, down: 3},
    author: {id: 1, name: "Kabamgamer"},
    defenses: {
      1: {
        incrementId: 1,
        id: "Ballista",
        label: "Ballista",
        mapIcon: "squire_ballista.png",
        relic: {"mods": ["defense_rate_servo", "defense_range_servo", "anti_melee_servo"]},
        shards: ["destruction", "mass_destruction", "vampiric_empowerment"]
      },
      2: {
        incrementId: 2,
        id: "SpikeBlockade",
        label: "Spike Blockade",
        mapIcon: "squire_spike_blockade.png",
        relic: {"mods": ["hardened_servo", "accumulator_servo", "fortitude_servo"]},
        shards: ["auto_repair_system", "juggernaut", "automation"]
      }
    },
    mapLayout: [{
      incrementId: 1,
      defenseIncrementId: 1,
      rotationInDegrees: 0,
      position: {x: 479, y: 658}
    }, {
      incrementId: 3,
      defenseIncrementId: 1,
      rotationInDegrees: 337.786,
      position: {x: 520, y: 665}
    }, {
      incrementId: 4,
      defenseIncrementId: 2,
      rotationInDegrees: 0,
      position: {x: 499, y: 620}
    }, {
      incrementId: 5,
      defenseIncrementId: 2,
      rotationInDegrees: 20.13630342824814,
      position: {x: 715, y: 645}
    }, {
      incrementId: 6,
      defenseIncrementId: 2,
      rotationInDegrees: 0,
      position: {x: 582, y: 625}
    }, {
      incrementId: 7,
      defenseIncrementId: 1,
      rotationInDegrees: 21.95245249194039,
      position: {x: 677, y: 675}
    }, {
      incrementId: 8,
      defenseIncrementId: 1,
      rotationInDegrees: 0,
      position: {x: 714, y: 689}
    }, {
      incrementId: 9,
      defenseIncrementId: 1,
      rotationInDegrees: 13.134022306396304,
      position: {x: 695, y: 682}
    }, {
      incrementId: 10,
      defenseIncrementId: 1,
      rotationInDegrees: 0,
      position: {x: 596, y: 664}
    }, {
      incrementId: 11, 
      defenseIncrementId: 1, 
      rotationInDegrees: 0, 
      position: {x: 572, y: 664}
    }]
  };
  if (mapConfigurations.value.map) {
    map.value = await getMapById(mapConfigurations.value.map)
  }

  loading.value = false
}

watch(mapConfigurations, async () => {
  if (!mapConfigurations.value.defenses) {
    return;
  }

  const resolvedDefensesDu = {};
  for (const defense of Object.values(mapConfigurations.value.defenses)) {
    resolvedDefensesDu[defense.incrementId] = (await getDefenseRoot(defense.id)).defenseUnits;
  }

  totalDu.value = mapConfigurations.value.mapLayout.reduce((total, defensePosition) => {
    return total + resolvedDefensesDu[defensePosition.defenseIncrementId];
  }, 0);
}, {deep: true});

onMounted(() => {
  loadMapConfigurations()
})
</script>

<style scoped>
.accordion-header .add-defense {
  cursor: pointer;
}

.hide-defense {
  cursor: pointer;
  font-size: 14pt;
}

.tag {
  margin-left: 5px;
}
.votes__actions {
  margin-left: 10px;
}
.votes__actions .vote svg {
  margin-right: 5px;
}

.vote svg {
  cursor: pointer;
  font-size: x-large;
}
.vote.active svg {
  color: gold
}
</style>
