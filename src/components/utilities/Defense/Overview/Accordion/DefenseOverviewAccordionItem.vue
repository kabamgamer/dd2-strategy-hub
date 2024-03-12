<template>
  <div class="accordion-item position-relative defense-overview__accordion-item">
    <LoadingSpinner v-if="loading" />

    <h2 class="accordion-header defense-header" :id="id + '-heading'">
      <button class="accordion-button" type="button" :class="{ collapsed: defense.userData.isCollapsed }" data-bs-toggle="collapse" :data-bs-target="'#' + id" :aria-expanded="!defense.userData.isCollapsed" :aria-controls="id">
        <span class="d-flex justify-content-between w-100">
          <span class="defense-label">{{ defense.userData.label }}</span>

          <span class="defense-dps" v-if="!isBuffDefense">{{ Math.round(defenseStats.totalDps).toLocaleString('en-US') }}</span>
        </span>
      </button>
    </h2>

    <div :id="id" ref="accordionCollapse" class="accordion-collapse collapse" :class="{ show: !defense.userData.isCollapsed }" :aria-labelledby="id + '-heading'">
      <div class="accordion-body">
        <div class="defense-info">
          <div class="actions d-flex justify-content-between mb-2" v-if="!inSetup">
            <div class="defense-info__header-label" v-if="!inSetup">
              <input type="text" class="form-control" v-model="defense.userData.label" />
            </div>

            <button class="btn btn-danger" @click.prevent="$emit('defenseDelete', defense.userData.incrementId)">
              Delete
            </button>
          </div>

          <div class="defense-info__header d-flex align-items-center flex-column">
            <div class="defense-info__header-info mb-3 w-100 d-flex">
              <div class="defense-info__header-icon__wrapper">
                <div class="defense-info__header-icon">
                  <img :src="icon" :alt="'Defense Icon ' + defense.userData.label">
                </div>
              </div>

              <!-- Stats for buff defense -->
              <div class="defense-info__header-stats w-100">
                <span class="w-100 defense-info__header-stats__stat d-flex align-items-center">
                  <strong>Tier:</strong>
                  <div class="defense-info__level d-flex">
                    <button class="btn btn-link" @click="$emit('defenseLevelUpdate', defenseLevel-1)" :disabled="defenseLevel===1"><IconChevronDown /></button>
                    <span class="defense-info__level-value">{{ defenseLevel }}</span>
                    <button class="btn btn-link" @click="$emit('defenseLevelUpdate', defenseLevel+1)" :disabled="defenseLevel===5"><IconChevronUp /></button>
                  </div>

                  <span class="badge rounded-pill bg-success du-badge">{{ defense.defenseData?.defenseUnits }} DU</span>
                </span>

                <template v-if="!isBuffDefense">
                  <span class="w-100 defense-info__header-stats__stat"><strong>Tooltip DPS:</strong> {{ Math.round(defenseStats.tooltipDps).toLocaleString('en-US') }}</span>
                  <span class="w-100 defense-info__header-stats__stat"><strong>Defense HP:</strong> {{ Math.round(defenseStats.defenseHitPoints).toLocaleString('en-US') }}</span>
                  <span class="w-100 defense-info__header-stats__stat"><strong>Defense Rate:</strong> {{ defenseStats.attackRate.toFixed(3).replace(/(\.[^0]*)0+$/, '$1').replace(/\.$/, '') }} ({{ defenseStats.attackRatePercentage }}%)</span>
                  <span class="w-100 defense-info__header-stats__stat"><strong>Defense Range:</strong> {{ defenseStats.defenseRange }}</span>
                  <span class="w-100 defense-info__header-stats__stat"><strong>Crit chance:</strong> {{ (defenseStats.criticalChance * 100).toFixed(2) }}%</span>
                  <span class="w-100 defense-info__header-stats__stat"><strong>Crit damage:</strong> {{ (defenseStats.criticalDamage * 100).toFixed(2) }}%</span>
                </template>

                <template v-else>
                  <span class="w-100 defense-info__header-stats__stat"><strong>Defense Power bonus:</strong> {{ Math.round(defenseStats.defensePower / 10) }}</span>
                  <span class="w-100 defense-info__header-stats__stat"><strong>Crit damage bonus:</strong> {{ (defenseStats.criticalDamage * 100 / 4).toFixed(2) }}%</span>
                  <span class="w-100 defense-info__header-stats__stat"><strong>Defense Range:</strong> {{ defenseStats.defenseRange }}</span>
                </template>

                <div v-for="(stat, index) in defenseSpecificStats" :key="index">
                  <DefenseSpecificStat :stat="stat" />
                </div>
              </div>
            </div>
          </div>

          <slot name="defense-details">
            <div class="accordion-header">
              <button class="accordion-button user-details-collapse p-0" :class="{ collapsed: defense.userData.isUserDataCollapsed }" type="button" data-bs-toggle="collapse" :data-bs-target="'#userDetails' + id">
                User details
              </button>
            </div>

            <div :id="'userDetails' + id" class="collapse" :class="{ show: !defense.userData.isUserDataCollapsed }">
              <hr />

              <DefenseUserInfo :defense="defense" />
            </div>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps } from "vue";
import { storeToRefs } from "pinia";

import type { PropType } from "vue";
import type { DefenseStatsInterface } from "@/types";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";

import LoadingSpinner from "@/components/layout/LoadingSpinner.vue";
import IconChevronDown from "@/components/icons/IconChevronDown.vue";
import IconChevronUp from "@/components/icons/IconChevronUp.vue";
import DefenseSpecificStat from "@/components/utilities/Defense/DefenseSpecificStat.vue";
import DefenseUserInfo from "@/components/utilities/Defense/DefenseUserInfo.vue";

import { useGoogleSpreadsheetDataStore } from "@/stores/GoogleSpreadSheets";

const props = defineProps({
  id: String,
  icon: String,
  defenseLevel: Number,
  defenseSpecificStats: Array,
  inSetup: Boolean,
  isBuffDefense: Boolean,
  defenseStats: Object as PropType<DefenseStatsInterface>,
  defense: {
    type: Object as PropType<UserDataStoreDefenseInterface>,
    required: true,
  },
});

const { loading } = storeToRefs(useGoogleSpreadsheetDataStore())

const accordionCollapse = ref()

onMounted(() => {
  accordionCollapse.value?.addEventListener('hidden.bs.collapse', function (event: Event) {
    if (props.inSetup) return

    if ((event.target as HTMLElement).id !== props.id) {
      (props.defense as UserDataStoreDefenseInterface).userData.isUserDataCollapsed = true
      return
    }

    (props.defense as UserDataStoreDefenseInterface).userData.isCollapsed = true
  })
  accordionCollapse.value?.addEventListener('shown.bs.collapse', function (event: Event) {
    if (props.inSetup) return

    if ((event.target as HTMLElement).id !== props.id) {
      (props.defense as UserDataStoreDefenseInterface).userData.isUserDataCollapsed = false
      return
    }

    (props.defense as UserDataStoreDefenseInterface).userData.isCollapsed = false
  })
});
</script>

<style lang="scss">
.defense-overview__accordion-item {
  .defense-info {
    &__header {
      &-icon {
        border: 1px solid grey;

        &__wrapper {
          width: 60%;
          max-width: 150px;
        }

        img {
          width: 100%;
        }
      }

      &-stats {
        margin-left: 5px;
        font-size: larger;
        display: flex;
        flex-direction: column;

        &__stat {
          font-size: 12pt;
        }
      }
    }

    &__level {
      .btn {
        padding: 0 3px;
        margin: 0;

        svg {
          color: var(--bs-accordion-color);
          width: 15px;
        }
      }
    }
  }

  .du-badge {
    margin-left: auto
  }

  .defense-dps {
    margin-right: 5px
  }

  .defense-header {
    position: sticky;
    top: 54px; /* height of navbar */
    z-index: 100;
  }
  .accordion-button {
    font-weight: bold;

    &:focus {
      box-shadow: none;
    }

    &.user-details-collapse {
      background: transparent;
      color: var(--bs-body-color);
      box-shadow: none;
    }
  }
}
</style>