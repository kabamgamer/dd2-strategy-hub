<template>
  <div class="container-fluid">
    <Section :section-title="mapConfigurations.title">
      <div class="row">
        <div class="col-md-9">
          <CommunityMap :map="mapConfigurations.map">
            <template #defenses>
              <MapDefense v-for="defensePosition in mapConfigurations.mapLayout"
                          :key="defensePosition.incrementId"
                          :editMode="editMode"
                          :icon="mapConfigurations.defenses[defensePosition.defenseIncrementId].mapIcon"
                          :position="defensePosition.position"
                          :rotation="defensePosition.rotationInDegrees"
                          @delete="deleteDefensePosition(defensePosition.incrementId)"
                          @update:position="(position) => defensePosition.position = position"
                          @update:rotation="(rotation) => defensePosition.rotationInDegrees = rotation"
              />
            </template>
          </CommunityMap>
        </div>

        <div class="col-md-3">
          <Card cardTitle="Defenses">
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
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from "vue";
import { storeToRefs } from "pinia";

import Section from "@/components/layout/Section.vue";
import CommunityMap from "@/components/utilities/CommunityMaps/CommunityMap.vue";
import Card from "@/components/layout/Card.vue";
import MapDefense from "@/components/utilities/CommunityMaps/Defense/MapDefense.vue";
import DefensePreview from "@/components/utilities/Defense/DefensePreview.vue";
import DefenseSelection from "@/components/utilities/Defense/DefenseSelection.vue";
import { DefenseRootInterface } from "@/interaces";

const props = defineProps({
  editMode: {
    type: Boolean,
    default: true,
  },
});

// Demo data, replace with API call
const mapConfigurations = ref({
  title: "Beat gates with squire only",
  map: "map_dragonfall_town_gates_of_dragonfall.png",
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
    position: {"x": 480, "y": 747}
  }, {
    incrementId: 3,
    defenseIncrementId: 1,
    rotationInDegrees: 337.786,
    position: {"x": 532, "y": 752}
  }, {
    incrementId: 4,
    defenseIncrementId: 2,
    rotationInDegrees: 0,
    position: {"x": 510, "y": 718}
  }, {
    incrementId: 5,
    defenseIncrementId: 2,
    rotationInDegrees: 20.13630342824814,
    position: {"x": 713, "y": 757}
  }, {
    incrementId: 6,
    defenseIncrementId: 2,
    rotationInDegrees: 0,
    position: {"x": 592, "y": 717}
  }, {
    incrementId: 7,
    defenseIncrementId: 1,
    rotationInDegrees: 21.95245249194039,
    position: {"x": 674, "y": 782}
  }, {
    incrementId: 8,
    defenseIncrementId: 1,
    rotationInDegrees: 0,
    position: {"x": 718, "y": 801}
  }, {
    incrementId: 9,
    defenseIncrementId: 1,
    rotationInDegrees: 13.134022306396304,
    position: {"x": 695, "y": 799}
  }, {
    incrementId: 10,
    defenseIncrementId: 1,
    rotationInDegrees: 0,
    position: {"x": 599, "y": 757}
  }, {
    incrementId: 11,
    defenseIncrementId: 1,
    rotationInDegrees: 0,
    position: {"x": 575, "y": 760}
  }]
});

function addDefensePosition(defenseIncrementId) {
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

function deleteDefensePosition(incrementId) {
  mapConfigurations.value.mapLayout = mapConfigurations.value.mapLayout.filter((defensePosition) => {
    return defensePosition.incrementId !== incrementId;
  })
}

function onDefenseSelection(defenseData: DefenseRootInterface): void {
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
</script>

<style scoped>
.accordion-header .add-defense {
  cursor: pointer;
}
</style>
