<template>
  <div class="container-fluid community-map-container">
    <LoadingSpinner v-if="loading" />

    <Section :section-title="mapConfigurations?.title" v-else>
      <div class="row" v-if="map">
        <div class="col-md-9 map_wrapper">
          <CommunityMap :map="map" :key="communityMapKey">
            <template #defenses>
              <MapDefense :class="{hide: hideDefense[defensePosition.defenseIncrementId]}"
                          v-for="defensePosition in mapConfigurations.mapLayout"
                          :key="defensePosition.incrementId"
                          :editMode="editMode"
                          :icon="getDefenseMapIcon(defensePosition.defenseIncrementId)"
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
              <template v-if="can('map.update', [mapConfigurations])">
                <button class="btn m-1 btn-danger" @click.prevent="mapDeletePromptModal?.show()">Delete map</button>
                <button class="btn m-1 btn-primary" @click.prevent="editMode = true; communityMapKey++">Edit</button>
              </template>
            </div>
            <div class="actions" v-else>
              <button class="btn m-1 btn-warning" @click.prevent="mapMetaConfigurationModal?.show()">Edit tags</button>
              <button class="btn m-1 btn-success" :class="{disabled: !validatedMap}" :disabled="!validatedMap" @click.prevent="onSave">Save</button>
            </div>
          </div>
          <Card class="mb-3" :cardTitle="map.name" :maxHeight="false">
            <strong>Map:</strong> {{ map.name }} <br />
            <strong>Author:</strong> <router-link :to="{name: 'community-maps', query: {author: mapConfigurations.author?.id}}">{{ mapConfigurations.author?.name }}</router-link> <br />
            <strong>Game mode:</strong> {{ mapConfigurations.gameMode }} <br />
            <strong>Difficulty:</strong> {{ mapConfigurations.difficulty }} <br />
            <strong>Tags:</strong> <span v-for="tag in mapConfigurations.tags" :key="tag" class="tag badge bg-success">{{ tag }}</span> <br />
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
            <template v-if="editMode">
              <h2>Add defense</h2>
              <DefenseSelection clear-on-select @change="onDefenseSelection" />
              <hr />
            </template>
            <div class="accordion accordion-flush defenses-accordion" id="mapDefenseConfigurations">
              <div class="accordion-item" :key="defense.incrementId" v-for="defense in mapConfigurations.defenses">
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

      <Card cardTitle="Description" :maxHeight="false" class="mt-5">
        <div class="description" v-html="mapConfigurations.description"></div>
      </Card>
    </Section>

    <BootstrapModal v-if="editMode" ref="mapMetaConfigurationModal" title="Map settings" :can-manually-close="false">
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
              <option value="Adventure">Adventure</option>
              <option value="Expedition">Expedition</option>
              <option value="Survival">Survival</option>
              <option value="Mastery">Mastery</option>
              <option value="Incursion">Incursion</option>
            </select>
          </div>

          <div class="form-group mt-3">
            <label for="map">Difficulty</label>
            <select class="form-select" v-model="mapConfigurations.difficulty" :disabled="!mapConfigurations.gameMode">
              <option v-for="difficulty in gameModeDifficulties" :key="difficulty" :value="difficulty">{{ difficulty }}</option>
            </select>
          </div>

          <div class="form-group mt-3">
            <label for="map">Tags</label>
            <Multiselect
                v-model="mapConfigurations.tags"
                mode="tags"
                :close-on-select="false"
                :options="['AFKable', 'Base heroes', 'No blockades', 'Petrify', 'Electrocute', 'Freeze', 'Shatter', 'Ignite', 'Turtle build', 'Spawn kill']"
            />
          </div>

          <div class="form-group mt-3">
            <label for="map">Description</label>
            <QuillEditor toolbar="minimal" v-model:content="mapConfigurations.description" contentType="html" />
          </div>
        </div>
      </template>

      <template #footer>
        <button class="btn btn-danger" @click.prevent="mapMetaConfigurationModal?.hide(); router.back()">Cancel</button>
        <button class="btn btn-success" :class="{disabled: !validatedMeta}" :disabled="!validatedMeta" @click.prevent="mapMetaConfigurationModal?.hide()">Save</button>
      </template>
    </BootstrapModal>
    <BootstrapModal v-if="mapConfigurations.id && can('map.update', [mapConfigurations])" ref="mapDeletePromptModal" title="Delete map">
      <template #body>
        <p>Are you sure you want to delete this map?</p>
        <i>This action cannot be undone</i>
      </template>

      <template #footer>
        <button class="btn btn-danger" @click.prevent="onDelete">Delete</button>
      </template>
    </BootstrapModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from 'vue-router'
import { Collapse } from "bootstrap";

import { QuillEditor } from '@vueup/vue-quill'
import Multiselect from '@vueform/multiselect'
import Section from "@/components/layout/Section.vue";
import CommunityMap from "@/components/utilities/CommunityMaps/CommunityMap.vue";
import Card from "@/components/layout/Card.vue";
import MapDefense from "@/components/utilities/CommunityMaps/Defense/MapDefense.vue";
import DefensePreview from "@/components/utilities/Defense/DefensePreview.vue";
import DefenseSelection from "@/components/utilities/Defense/DefenseSelection.vue";
import LoadingSpinner from "@/components/layout/LoadingSpinner.vue";
import type { DefenseRootInterface, MapConfigInterface, MapDefenseInterface, MapDefensePlacementInterface } from "@/interaces";
import type MapData from "@/data/MapData";

import useCommunityMapsApi from "@/api/CommunityMapsApi";
import { useMapStore } from "@/stores/Map";
import { useDefenseStore } from "@/stores/DefenseInfo";
import { useUserStore } from "@/stores/User";
import { useAcl } from "@/composables/Acl";

import IconCaretUp from "@/components/icons/IconCaretUp.vue";
import IconCaretDown from "@/components/icons/IconCaretDown.vue";
import BootstrapModal from "@/components/layout/BootstrapModal.vue";
import MapSelection from "@/components/utilities/CommunityMaps/MapSelection.vue";
import Input from "@/components/layout/form/Input.vue";
import IconEye from "@/components/icons/IconEye.vue";
import IconEyeSlash from "@/components/icons/IconEyeSlash.vue";

const { getCommunityMapById, createCommunityMap, updateCommunityMap, deleteCommunityMap, voteCommunityMap } = useCommunityMapsApi();
const { getMapById } = useMapStore();
const { getDefenseRoot } = useDefenseStore();
const { user } = useUserStore();

const { can } = useAcl();

const route = useRoute()
const router = useRouter()
const editMode = ref<boolean>(route.params.id === "new")
const communityMapKey = ref<number>(0)
const totalDu = ref<number>(0)
const loading = ref(true)
const map = ref<MapData>()
const mapMetaConfigurationModal = ref<typeof BootstrapModal>()
const mapDeletePromptModal = ref<typeof BootstrapModal>()
const mapConfigurations = ref<MapConfigInterface>({} as MapConfigInterface)
const hideDefense = ref<{[defenseIncrementId: number]: boolean}>({})
const validatedMeta = computed(() => {
  return mapConfigurations.value.title && mapConfigurations.value.map && mapConfigurations.value.gameMode && mapConfigurations.value.difficulty
})
const validatedMap = computed(() => {
  return mapConfigurations.value.mapLayout && mapConfigurations.value.mapLayout.length > 0
})
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

function addDefensePosition(defenseIncrementId: number): void {
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
  if (mapConfigurations.value.userVote === userVote) return;

  voteCommunityMap(mapConfigurations.value.id, userVote)
      .then(() => {
        if (mapConfigurations.value.userVote !== null) {
          // @ts-ignore
          mapConfigurations.value.votes[mapConfigurations.value.userVote] -= 1
        }

        // @ts-ignore
        mapConfigurations.value.votes[userVote] += 1

        mapConfigurations.value.userVote = userVote
      })
}

function deleteDefensePosition(incrementId: number): void {
  mapConfigurations.value.mapLayout = mapConfigurations.value.mapLayout.filter((defensePosition) => {
    return defensePosition.incrementId !== incrementId;
  })
}

function onMapSelect(selectedMap: MapData): void {
  map.value = selectedMap
  mapConfigurations.value.map = selectedMap.id
}

async function onSave(): Promise<void> {
  if (route.params.id === 'new') {
    createCommunityMap(mapConfigurations.value)
        .then((response: any) => {
          router.push({ name: 'community-maps.detail', params: { id: response.id } }).then(() => {
            editMode.value = false
            communityMapKey.value++
            loadMapConfigurations()
          })
        })
  } else {
    updateCommunityMap(mapConfigurations.value)
        .then(() => {
          editMode.value = false
          communityMapKey.value++
          loadMapConfigurations()
        })
  }
}

function getDefenseMapIcon(defenseIncrementId: number): string {
  const defense: MapDefenseInterface = mapConfigurations.value.defenses.find((defense) => defense.incrementId === defenseIncrementId) as MapDefenseInterface
  return defense.mapIcon
}

function onDefenseSelection(defenseData: DefenseRootInterface): void {
  mapConfigurations.value.defenses = mapConfigurations.value.defenses || []
  const nextDefenseIncrementId = Math.max(...mapConfigurations.value.defenses.map((defense) => defense.incrementId), 0) + 1;
  mapConfigurations.value.defenses.push({
    incrementId: nextDefenseIncrementId,
    id: defenseData.id,
    label: defenseData.name,
    mapIcon: defenseData.mapIcon,
    relic: {
      mods: []
    },
    shards: []
  })
}

function openDefenseAccordion(defenseIncrementId: number): void {
  const parent = document.getElementById('mapDefenseConfigurations') as Element
  const defenseAccordionElement = document.getElementById('flush-collapse' + defenseIncrementId) as Element
  Collapse.getOrCreateInstance(defenseAccordionElement, {parent, toggle: false}).show();
  defenseAccordionElement.addEventListener('shown.bs.collapse', () => {
    defenseAccordionElement.scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"});
  })
}

function initNewMapConfigurations(): void {
  loading.value = false
  mapConfigurations.value = {
    author: {id: user?.id, name: user?.name},
    votes: {up: 0, down: 0},
  } as unknown as MapConfigInterface
  mapMetaConfigurationModal.value?.show()
}

function onDelete(): void {
  deleteCommunityMap(mapConfigurations.value.id)
      .then(() => {
        mapDeletePromptModal.value?.hide()
        router.push({name: 'community-maps'})
      })
      .catch((e: Error) => {
        console.error(e)
      })
}

async function loadMapConfigurations(): Promise<void> {
  loading.value = true

  mapConfigurations.value = await getCommunityMapById(route.params.id)
  if (mapConfigurations.value.map) {
    map.value = await getMapById(mapConfigurations.value.map)
  }

  loading.value = false
}

watch(mapConfigurations, async () => {
  if (!mapConfigurations.value.defenses) {
    return;
  }

  const resolvedDefensesDu: {[defenseIncrementId: number]: number} = {};
  for (const defense of mapConfigurations.value.defenses) {
    resolvedDefensesDu[defense.incrementId] = (await getDefenseRoot(defense.id)).defenseUnits;
  }

  mapConfigurations.value.mapLayout = mapConfigurations.value.mapLayout || []
  totalDu.value = mapConfigurations.value.mapLayout.reduce((total: number, defensePosition: MapDefensePlacementInterface) => {
    return total + resolvedDefensesDu[defensePosition.defenseIncrementId];
  }, 0) as number;
}, {deep: true});

onMounted(() => {
  if (route.params.id === 'new') {
    initNewMapConfigurations()
  } else {
    loadMapConfigurations()
  }
})
</script>

<style scoped>
.accordion-header .add-defense {
  cursor: pointer;
}

.defenses-accordion {
  max-height: 545px;
  overflow: scroll;
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

.map_wrapper {
  overflow-x: overlay;
}

@media (min-width: 1580px) {
  .map_wrapper {
    overflow-x: hidden;
  }
  .community-map-container {
    max-width: 1500px;
  }
}
</style>

<style>
.ql-align-center {
  text-align: center;
}
.ql-align-right {
  text-align: right;
}
.ql-align-justify {
  text-align: justify;
}
</style>
