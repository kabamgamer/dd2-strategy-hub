<template>
  <div class="container-fluid community-map-container">

    <h1>{{ mapConfigurations?.title }}</h1>

    <LoadingSpinner v-if="loading" />

    <Section v-else>
      <div class="row" v-if="map">
        <div class="col-md-9 map_wrapper">
          <CommunityMap :map="map" :key="communityMapKey">
            <template #defenses>
              <MapDefense :class="{hide: hideDefense[defensePosition.defenseIncrementId]}"
                          v-for="defensePosition in mapConfigurations.mapLayout"
                          :key="defensePosition.incrementId"
                          :showDefenseIcon="showDefenseIcons"
                          :editMode="editMode"
                          :defense="resolvedDefenses[defensePosition.defenseIncrementId]"
                          :position="defensePosition.position"
                          :rotation="defensePosition.rotationInDegrees"
                          :legendColor="getLegendColor(defensePosition.defenseIncrementId)"
                          @selectDefense="openDefenseAccordion(defensePosition.defenseIncrementId)"
                          @delete="deleteDefensePosition(defensePosition.incrementId)"
                          @duplicate="duplicateDefensePosition(defensePosition)"
                          @update:position="(position) => defensePosition.position = position"
                          @update:rotation="(rotation) => defensePosition.rotationInDegrees = rotation"
              />
              <MapIcon v-for="iconPosition in mapConfigurations.icons"
                       :key="iconPosition.incrementId"
                       :icon-id="iconPosition.iconId"
                       :editMode="editMode"
                       :position="iconPosition.position"
                       @update:position="(position) => iconPosition.position = position"
                       @delete="deleteIconPosition(iconPosition.incrementId)"
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
            <strong>Author:</strong> <router-link :to="{name: 'community-maps', query: {author: mapConfigurations.author?.name}}">{{ mapConfigurations.author?.name }}</router-link> <br />
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
          
          <Card class="mb-3 custom-icons" cardTitle="Icons" :maxHeight="false" v-if="editMode">
            <button class="btn" @click="addIconPosition(iconId)" v-for="iconId in 5" :key="iconId">
              <DigitIcon :icon-id="iconId" />
            </button>
          </Card>

          <Card :maxHeight="false">
            <template #header>
              <div class="d-flex justify-content-between align-items-center">
                <span>Defenses</span>
                <span class="text-muted d-flex" style="gap: 5px">Toggle legend <SwitchField v-model="showDefenseIcons" rounded /></span>
              </div>
            </template>
            <template v-if="editMode">
              <h2>Add defense</h2>
              <DefenseSelection clear-on-select @change="onDefenseSelection" :tabs="defenseSelectionTabs" />
              <hr />
            </template>
            <div class="accordion accordion-flush defenses-accordion" id="mapDefenseConfigurations">
              <div class="accordion-item" :key="defense.incrementId" v-for="defense in mapConfigurations.defenses">
                <h2 class="accordion-header d-flex align-items-center" :id="'flush-heading' + defense.incrementId">
                  <div class="add-defense" @click="addDefensePosition(defense.incrementId)" v-if="editMode">+</div>
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="'#flush-collapse' + defense.incrementId">
                    <!-- little square with legend color -->
                    <span v-if="!showDefenseIcons" class="badge bg-legend me-2" :style="{backgroundColor: getLegendColor(defense.incrementId)}">&nbsp;</span>
                    {{ defense.label }}
                  </button>
                  <div class="hide-defense" @click="hideDefense[defense.incrementId] = !hideDefense[defense.incrementId]">
                    <IconEyeSlash v-if="hideDefense[defense.incrementId]" />
                    <IconEye v-else />
                  </div>
                </h2>
                <div :id="'flush-collapse' + defense.incrementId" class="accordion-collapse collapse" data-bs-parent="#mapDefenseConfigurations">
                  <DefensePreview :defense="defense" :editMode="editMode" @delete="onDefenseDelete(defense)" />
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

    <BootstrapModal v-if="editMode" ref="mapMetaConfigurationModal" title="Map settings" :can-manually-close="false" prevent-move>
      <template #body>
        <LoadingSpinner v-if="loading" />

        <div class="settings" v-else>
          <Input v-model="mapMetaForm.title" id="title" label="Title" />

          <div class="form-group mt-3" v-if="!mapMetaForm.map">
            <label for="map">Map</label>
            <MapSelection @change="onMapSelect" id="map" />
          </div>

          <div class="form-group mt-3">
            <label for="map">Game Mode</label>
            <select class="form-select" v-model="mapMetaForm.gameMode" @change="mapMetaForm.difficulty = null">
              <option value="Adventure">Adventure</option>
              <option value="Expedition">Expedition</option>
              <option value="Survival">Survival</option>
              <option value="Mastery">Mastery</option>
              <option value="Incursion">Incursion</option>
            </select>
          </div>

          <div class="form-group mt-3">
            <label for="map">Difficulty</label>
            <select class="form-select" v-model="mapMetaForm.difficulty" :disabled="!mapMetaForm.gameMode">
              <option v-for="difficulty in gameModeDifficulties" :key="difficulty" :value="difficulty">{{ difficulty }}</option>
            </select>
          </div>

          <div class="form-group mt-3">
            <label for="map">Tags</label>
            <Multiselect
                v-model="mapMetaForm.tags"
                mode="tags"
                :close-on-select="false"
                :options="tags"
            />
          </div>

          <div class="form-group mt-3">
            <label for="map">Description</label>
            <NotificationList location="quill-editor" />
            <QuillEditor toolbar="minimal" v-model:content="mapMetaForm.description" contentType="html" />
          </div>
        </div>
      </template>

      <template #footer>
        <button class="btn btn-danger" @click.prevent="cancelMetaDataEdit">Cancel</button>
        <button class="btn btn-success" :class="{disabled: !validatedMeta}" :disabled="!validatedMeta" @click.prevent="onSaveMetaData">Save</button>
      </template>
    </BootstrapModal>
    <BootstrapModal v-if="mapConfigurations.id && can('map.update', [mapConfigurations])" ref="mapDeletePromptModal" title="Delete map" prevent-move>
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
import { storeToRefs } from "pinia";
import { Collapse } from "bootstrap";

import tags from "@/data/communityMapTags.json";

import Multiselect from '@vueform/multiselect'
import Section from "@/components/layout/Section.vue";
import CommunityMap from "@/components/utilities/CommunityMaps/CommunityMap.vue";
import Card from "@/components/layout/Card.vue";
import QuillEditor from '@/components/layout/form/QuillEditor.vue'
import MapDefense from "@/components/utilities/CommunityMaps/Defense/MapDefense.vue";
import MapIcon from "@/components/utilities/CommunityMaps/Defense/MapIcon.vue";
import DefensePreview from "@/components/utilities/Defense/DefensePreview.vue";
import DefenseSelection from "@/components/utilities/Defense/DefenseSelection.vue";
import LoadingSpinner from "@/components/layout/LoadingSpinner.vue";
import NotificationList from "@/components/utilities/NotificationList.vue";
import SwitchField from "@/components/layout/form/SwitchField.vue";
import BootstrapModal from "@/components/layout/BootstrapModal.vue";
import MapSelection from "@/components/utilities/CommunityMaps/MapSelection.vue";
import Input from "@/components/layout/form/Input.vue";

import type {
  DefenseRootInterface,
  MapConfigInterface,
  MapDefensePlacementInterface
} from "@/types";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";
import type MapData from "@/data/MapData";
import type { MetaDataComposable } from "@/composables/SEO/metaData";

import useCommunityMapsApi from "@/api/CommunityMapsApi";
import { useMapStore } from "@/stores/Map";
import { useDefenseStore } from "@/stores/DefenseInfo";
import { useUserStore } from "@/stores/User";
import { useUserDataStore } from "@/stores/UserData";
import { useNotificationStore } from "@/stores/Notifications";
import { useAcl } from "@/composables/Acl";
import { useLegend } from "@/composables/Legend";

import DigitIcon from "@/components/icons/digits/DigitIcon.vue";
import IconCaretUp from "@/components/icons/IconCaretUp.vue";
import IconCaretDown from "@/components/icons/IconCaretDown.vue";
import IconEye from "@/components/icons/IconEye.vue";
import IconEyeSlash from "@/components/icons/IconEyeSlash.vue";
import { useProtobot } from "@/composables/Protobot";
import useForm from "@/composables/Form";

const { getCommunityMapById, createCommunityMap, updateCommunityMap, deleteCommunityMap, removeVoteForCommunityMap, voteCommunityMap } = useCommunityMapsApi();
const { protobotDefenses } = useProtobot();
const { getMapById } = useMapStore();
const { getDefenseRoot } = useDefenseStore();
const { user } = storeToRefs(useUserStore());
const { defenses } = storeToRefs(useUserDataStore());
const { addNotification, notificationsFromErrors } = useNotificationStore();

const { can } = useAcl();
const { getLegendColor } = useLegend();

const route = useRoute()
const router = useRouter()
const showDefenseIcons = ref<boolean>(true)
const editMode = ref<boolean>(route.params.id === "new")
const communityMapKey = ref<number>(0)
const totalDu = ref<number>(0)
const resolvedDefenses = ref<{[defenseIncrementId: number]: DefenseRootInterface}>({})
const loading = ref(true)
const map = ref<MapData>()
const mapMetaConfigurationModal = ref<typeof BootstrapModal>()
const mapDeletePromptModal = ref<typeof BootstrapModal>()
const mapConfigurations = ref<MapConfigInterface>({} as MapConfigInterface)
const hideDefense = ref<{[defenseIncrementId: number]: boolean}>({})
const defenseSelectionTabs = computed((): any[] => [{
  label: 'Presets',
  options: {
    'Your defenses': defenses.value,
    'Protobot recommended': protobotDefenses.value,
  },
}])

const mapMetaForm = useForm({
  title: '',
  map: '',
  gameMode: '',
  difficulty: null,
  description: '',
  tags: [],
}, false)

const validatedMeta = computed(() => {
  return mapMetaForm.title && mapMetaForm.map && mapMetaForm.gameMode && mapMetaForm.difficulty
})

const validatedMap = computed(() => {
  return mapConfigurations.value.mapLayout && mapConfigurations.value.mapLayout.length > 0
})

const gameModeDifficulties = computed(() => {
  switch (mapMetaForm.gameMode) {
    case "Adventures":
      return ["Medium", "Hard"]
    case "Survival":
      return ["Wave 0-40", "Wave 41-50", "Wave 51-60", "Wave 61-70", "Wave 71-150", "Wave 151+"]
    default:
      return ["Chaos 1", "Chaos 2", "Chaos 3", "Chaos 4", "Chaos 5", "Chaos 6", "Chaos 7", "Chaos 8", "Chaos 9", "Chaos 10"]
  }
})

function cancelMetaDataEdit(): void {
  if (route.params.id === 'new') {
    mapMetaConfigurationModal.value?.hide();
    router.push({name: 'community-maps'});
    return
  }

  mapMetaForm.reset();
  mapMetaConfigurationModal.value?.hide();
}

function onSaveMetaData(): void {
  if (!mapConfigurations.value.id) {
    mapMetaConfigurationModal.value?.hide()
    return
  }

  mapMetaForm.patch(`/maps/${mapConfigurations.value.id}`)
      .then((response: any) => {
        mapMetaConfigurationModal.value?.hide()

        const data = response?.data
        if (!data) {
          return
        }

        // only update the mapConfiguration values that are also in the form
        const keysToUpdate = Object.keys(mapMetaForm.data())
        keysToUpdate.forEach((key: any) => {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            (mapConfigurations.value as any)[key] = data[key];
          }
        });
      })
}

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

function addIconPosition(iconId: number): void {
  mapConfigurations.value.icons = mapConfigurations.value.icons || []
  mapConfigurations.value.icons.push({
    incrementId: Math.max(...mapConfigurations.value.icons.map((defense) => defense.incrementId), 0) + 1,
    iconId,
    position: {
      x: 600,
      y: 300,
    }
  })
}

function deleteIconPosition(incrementId: number): void {
  mapConfigurations.value.icons = mapConfigurations.value.icons.filter((iconPosition) => {
    return iconPosition.incrementId !== incrementId;
  })
}

function vote(userVote: string): void {
  if (mapConfigurations.value.userVote === userVote) {
    removeVoteForCommunityMap(mapConfigurations.value.id)
        .then(() => {
          // @ts-ignore
          mapConfigurations.value.votes[userVote] -= 1
          mapConfigurations.value.userVote = null
        })
    return
  }

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

function duplicateDefensePosition(defensePosition: MapDefensePlacementInterface): void {mapConfigurations.value.mapLayout.push({
    incrementId: Math.max(...mapConfigurations.value.mapLayout.map((defense) => defense.incrementId), 0) + 1,
    defenseIncrementId: defensePosition.defenseIncrementId,
    rotationInDegrees: defensePosition.rotationInDegrees,
    position: {
      x: defensePosition.position.x + 10,
      y: defensePosition.position.y + 10,
    }
  })
}

function deleteDefensePosition(incrementId: number): void {
  mapConfigurations.value.mapLayout = mapConfigurations.value.mapLayout.filter((defensePosition) => {
    return defensePosition.incrementId !== incrementId;
  })
}

function onMapSelect(selectedMap: MapData): void {
  map.value = selectedMap
  mapMetaForm.map = selectedMap.id
}

async function onSave(): Promise<void> {
  const onError: any = (response: any) => {
    if (response.errors) {
      notificationsFromErrors(response.errors)
    } else {
      addNotification({
        id: 'error-map-save',
        type: 'alert',
        color: 'danger',
        message: 'Something went wrong',
        duration: 3000,
      })
      console.error(response)
    }
  }

  if (route.params.id === 'new') {
    createCommunityMap({ ...mapMetaForm.data(), ...mapConfigurations.value })
        .then((response: any) => {
          router.push({ name: 'community-maps.detail', params: { id: response.id } }).then(() => {
            editMode.value = false
            communityMapKey.value++
            loadMapConfigurations()
          })
          .catch(onError)
        })
  } else {
    updateCommunityMap(mapConfigurations.value)
        .then(() => {
          editMode.value = false
          communityMapKey.value++
          loadMapConfigurations()
        })
        .catch(onError)
  }
}

function onDefenseDelete(defenseData: any): void {
  // Remove all references from the map layout
  mapConfigurations.value.mapLayout = mapConfigurations.value.mapLayout.filter((defensePosition) => {
    return defensePosition.defenseIncrementId !== defenseData.incrementId;
  })

  // Remove the defense from the list of defenses
  mapConfigurations.value.defenses = mapConfigurations.value.defenses.filter((defense) => {
    return defense.incrementId !== defenseData.incrementId;
  })
}

function onDefenseSelection(defenseData: DefenseRootInterface|UserDataStoreDefenseInterface): void {
  mapConfigurations.value.defenses = mapConfigurations.value.defenses || []
  const nextDefenseIncrementId = Math.max(...mapConfigurations.value.defenses.map((defense) => defense.incrementId), 0) + 1;

  let defense: DefenseRootInterface = defenseData as DefenseRootInterface;
  let relicMods: string[] = [];
  let shards: string[] = [];
  let godlyStat: string = 'none';
  if ((defenseData as UserDataStoreDefenseInterface).incrementId) {
    defense = (defenseData as UserDataStoreDefenseInterface).defenseData as DefenseRootInterface;
    const userData = (defenseData as UserDataStoreDefenseInterface).userData;
    relicMods = userData.relic.mods;
    godlyStat = userData.relic.godlyStat?.type || 'none';
    shards = userData.shards;
  }

  mapConfigurations.value.defenses.push({
    incrementId: nextDefenseIncrementId,
    id: defense.id,
    label: defense.name,
    relic: {
      mods: relicMods,
      godlyStat: {
        type: godlyStat,
        value: 0,
      },
    },
    shards: shards,
  })
}

function openDefenseAccordion(defenseIncrementId: number): void {
  const parent = document.getElementById('mapDefenseConfigurations') as Element
  const defenseAccordionElement = document.getElementById('flush-collapse' + defenseIncrementId) as Element
  Collapse.getOrCreateInstance(defenseAccordionElement, {parent, toggle: false}).show();
  defenseAccordionElement.addEventListener('shown.bs.collapse', () => {
    defenseAccordionElement.previousElementSibling?.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
    defenseAccordionElement.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
  })
}

function initNewMapConfigurations(): void {
  loading.value = false
  mapConfigurations.value = {
    author: {id: user.value?.id, name: user.value?.name},
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
  if (mapConfigurations.value.createdAt) {
    mapConfigurations.value.createdAt = new Date(mapConfigurations.value.createdAt)
  }

  mapMetaForm.load(mapConfigurations.value);
  if (mapConfigurations.value.map) {
    map.value = await getMapById(mapConfigurations.value.map)
  }

  const metaInfo: undefined|MetaDataComposable = router.currentRoute.value.meta?.metaInfo as undefined|MetaDataComposable
  if (metaInfo) {
    metaInfo.set('title', mapConfigurations.value.title)
    metaInfo.set('description', `This ${mapConfigurations.value.gameMode} ${mapConfigurations.value.difficulty} build of "${map.value?.name ?? ''}" is brought to you by ${mapConfigurations.value.author.name}, published on ${mapConfigurations.value.createdAt.toLocaleDateString('en-US')}.`)
    metaInfo.set('keywords', [map.value?.name ?? '', 'community map', ...mapConfigurations.value.tags])
  }

  loading.value = false
}

watch(mapConfigurations, async () => {
  if (!mapConfigurations.value.defenses) {
    return;
  }

  for (const defense of mapConfigurations.value.defenses) {
    resolvedDefenses.value[defense.incrementId] = await getDefenseRoot(defense.id);
  }

  mapConfigurations.value.mapLayout = mapConfigurations.value.mapLayout || []
  totalDu.value = mapConfigurations.value.mapLayout.reduce((total: number, defensePosition: MapDefensePlacementInterface) => {
    return total + resolvedDefenses.value[defensePosition.defenseIncrementId].defenseUnits;
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

<style lang="scss" scoped>
.accordion-header .add-defense {
  cursor: pointer;
}

.defenses-accordion {
  max-height: 668px;
  overflow-y: auto;
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

<style lang="scss">
.description img {
  max-width: 100%;
}

.ql-align-center {
  text-align: center;
}
.ql-align-right {
  text-align: right;
}
.ql-align-justify {
  text-align: justify;
}

.custom-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;

  button {
    width: 20%;
    
    svg {
      height: 50px;
    }
  }
}
</style>
