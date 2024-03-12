<template>
  <div class="accordion mb-2" id="accordionFlushExample">
    <div class="accordion-item bg-secondary-subtle">
      <h2 class="accordion-header" id="flush-headingOne">
        <button class="accordion-button bg-secondary-subtle collapsed" type="button" data-bs-toggle="collapse"
                :data-bs-target="'#flush-collapse' + setupIncrementId" aria-expanded="false">
          Setup modifiers
        </button>
      </h2>

      <div :id="'flush-collapse' + setupIncrementId" class="accordion-collapse collapse" aria-labelledby="flush-headingOne"
           data-bs-parent="#accordionFlushExample">
        <div class="accordion-body">
          <div class="setup-modifiers__elemental-combos">
            <strong>
              Elemental combos:
            </strong>
            <div class="row">
              <div class="col-md-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" v-model="setupModifiers.combos.petrify"
                         :id="'petrifyModifiersCombo' + setupIncrementId">
                  <label class="form-check-label" :for="'petrifyModifiersCombo' + setupIncrementId">Petrified</label>
                </div>
              </div>

              <div class="col-md-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" v-model="setupModifiers.combos.ignite"
                         :id="'igniteModifiersCombo' + setupIncrementId">
                  <label class="form-check-label" :for="'igniteModifiersCombo' + setupIncrementId">Ignited</label>
                </div>
              </div>

              <div class="col-md-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" v-model="setupModifiers.combos.electrocute"
                         :id="'electrocuteModifiersCombo' + setupIncrementId">
                  <label class="form-check-label" :for="'electrocuteModifiersCombo' + setupIncrementId">Electrocuted</label>
                </div>
              </div>

              <div class="col-md-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" v-model="setupModifiers.combos.shatter"
                         :id="'shatterModifiersCombo' + setupIncrementId">
                  <label class="form-check-label" :for="'shatterModifiersCombo' + setupIncrementId">Shattered (not implemented)</label>
                </div>
              </div>
            </div>
          </div>

          <div class="setup-modifiers__hero-buffs mt-3">
            <strong>
              Hero buffs:
            </strong>
            <div class="row">
              <div class="col-md-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" v-model="setupModifiers.heroBuffs.talisman"
                         :id="'talismanHeroBuff' + setupIncrementId">
                  <label class="form-check-label" :for="'talismanHeroBuff' + setupIncrementId">Talisman</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" v-model="setupModifiers.heroBuffs.talismanChiSupercharge"
                         :id="'talismanChiSuperchargeHeroBuff' + setupIncrementId">
                  <label class="form-check-label" :for="'talismanChiSuperchargeHeroBuff' + setupIncrementId">Talisman Chi Supercharge (gilded)</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" v-model="setupModifiers.heroBuffs.talismanChiBurst"
                         :id="'talismanChiBurstHeroBuff' + setupIncrementId">
                  <label class="form-check-label" :for="'talismanChiBurstHeroBuff' + setupIncrementId">Talisman Chi Burst (gilded)</label>
                </div>
              </div>

              <div class="col-md-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" v-model="setupModifiers.heroBuffs.callToArms"
                         :id="'callToArmsHeroBuff' + setupIncrementId">
                  <label class="form-check-label" :for="'callToArmsHeroBuff' + setupIncrementId">Call to Arms</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" v-model="setupModifiers.heroBuffs.callToArmsInspiredShout"
                         :id="'callToArmsInspiredShoutHeroBuff' + setupIncrementId">
                  <label class="form-check-label" :for="'callToArmsInspiredShoutHeroBuff' + setupIncrementId">Call to Arms Inspired Shout (gilded)</label>
                </div>
              </div>

              <div class="col-md-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" v-model="setupModifiers.heroBuffs.eruption"
                         :id="'eruptionHeroBuff' + setupIncrementId">
                  <label class="form-check-label" :for="'eruptionHeroBuff' + setupIncrementId">Eruption</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" v-model="setupModifiers.heroBuffs.eruptionTwiceAsBright"
                         :id="'eruptionTwiceAsBrightHeroBuff' + setupIncrementId">
                  <label class="form-check-label" :for="'eruptionTwiceAsBrightHeroBuff' + setupIncrementId">Eruption Twice As Bright (gilded)</label>
                </div>
              </div>
            </div>
          </div>

          <div class="setup-modifiers__radiant-buffs mt-3">
            <strong>
              Radiant buffs:
            </strong>
            <div class="row">
              <div class="col-md-3">
                <label :for="'radiantPowerHeroBuff' + setupIncrementId" class="form-label">Radiant power</label>
                <input type="number" min="0" max="4" class="form-control form-control-sm" :id="'radiantPowerHeroBuff' + setupIncrementId" v-model="setupModifiers.heroBuffs.radiantPower">
                <div class="form-text">1 for each nearby hero with the shard</div>
              </div>

              <div class="col-md-3">
                <label :for="'radiantCriticalPowerHeroBuff' + setupIncrementId" class="form-label">Radiant critical power</label>
                <input type="number" min="0" max="4" class="form-control form-control-sm" :id="'radiantCriticalPowerHeroBuff' + setupIncrementId" v-model="setupModifiers.heroBuffs.radiantCriticalPower">
                <div class="form-text">1 for each nearby hero with the shard</div>
              </div>
            </div>
          </div>

          <div class="setup-modifiers__mutators mt-3">
            <strong>
              Lane mutators (<a target="_blank" href="https://wiki.dungeondefenders2.com/wiki/Mutators">more info</a>):
            </strong>
            <div class="row">
              <div class="col-md-2">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :id="'laneMutator[' + setupIncrementId + '][armored]'" v-model="setupModifiers.laneMutators.armored">
                  <label class="form-check-label" :for="'laneMutator[' + setupIncrementId + '][armored]'">Armored</label>
                </div>
              </div>

              <div class="col-md-2">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :id="'laneMutator[' + setupIncrementId + '][berserked]'" v-model="setupModifiers.laneMutators.berserked">
                  <label class="form-check-label" :for="'laneMutator[' + setupIncrementId + '][berserked]'">Berserked</label>
                </div>
              </div>

              <div class="col-md-2">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :id="'laneMutator[' + setupIncrementId + '][reckless]'" v-model="setupModifiers.laneMutators.reckless">
                  <label class="form-check-label" :for="'laneMutator[' + setupIncrementId + '][reckless]'">Reckless</label>
                </div>
              </div>

              <div class="col-md-2">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :id="'laneMutator[' + setupIncrementId + '][softSpot]'" v-model="setupModifiers.laneMutators.softSpot">
                  <label class="form-check-label" :for="'laneMutator[' + setupIncrementId + '][softSpot]'">Soft spot</label>
                </div>
              </div>

              <div class="col-md-2">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :id="'laneMutator[' + setupIncrementId + '][spellbreaker]'" v-model="setupModifiers.laneMutators.spellbreaker">
                  <label class="form-check-label" :for="'laneMutator[' + setupIncrementId + '][spellbreaker]'">Spellbreaker</label>
                </div>
              </div>
            </div>
          </div>

          <div class="setup-modifiers__enemy-types mt-3">
            <strong>
              Enemy types:
            </strong>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" :id="'enemyType[' + setupIncrementId + '][frost]'" v-model="setupModifiers.enemyType.frost">
              <label class="form-check-label" :for="'enemyType[' + setupIncrementId + '][frost]'">Frost Enemies (<a target="_blank" href="https://wiki.dungeondefenders2.com/wiki/Frost_Enemies">more info</a>)</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from "vue";
import { defineProps, defineEmits, watch, ref } from "vue";
import type { DefenseSetupModifiersInterface } from "@/types";

const props = defineProps({
  setupIncrementId: Number,
  modelValue: {
    type: Object as PropType<DefenseSetupModifiersInterface>,
    default: () => ({
      combos: {
        petrify: false,
        ignite: false,
        electrocute: false,
        shatter: false,
      },
      heroBuffs: {
        talisman: false,
        callToArms: false,
        radiantPower: 0,
        radiantCriticalPower: 0,
      },
    }),
  },
})
const emits = defineEmits(['change', 'update:modelValue']);

const setupModifiers = ref<DefenseSetupModifiersInterface>(props.modelValue as DefenseSetupModifiersInterface);

if (setupModifiers.value.laneMutators === undefined) {
  setupModifiers.value.laneMutators = {
    armored: false,
    berserked: false,
    reckless: false,
    softSpot: false,
    spellbreaker: false,
  };
}

if (setupModifiers.value.enemyType === undefined) {
  setupModifiers.value.enemyType = {
    frost: false,
  };
}

watch(setupModifiers, (newValue) => {
  emits('change', newValue);
  emits('update:modelValue', newValue);
}, {deep: true})
</script>

<style scoped>
.accordion .accordion-header .accordion-button:focus {
  box-shadow: none;
}
</style>
