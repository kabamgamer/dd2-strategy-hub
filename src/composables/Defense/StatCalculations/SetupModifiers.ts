import { computed } from 'vue';

import type { ComputedRef } from 'vue';
import type { UserDataStoreDefenseInterface } from '@/stores/UserData';
import type { CalculationConditionsInterface } from '@/composables/Defense/DefenseCalculations';
import useDefenseDamageType from "@/composables/Defense/DefenseDamageType";
import DamageType from '@/enums/DamageType';

interface DefenseSetupCalculationsComposable {
    defenseSetupComboBuffs: ComputedRef<number>,
    defenseSetupHeroBuffs: ComputedRef<number>,
    defenseSetupModifiers: ComputedRef<number>,
}

export default function useSetupCalculations(
    defense: UserDataStoreDefenseInterface,
    calculationConditions: CalculationConditionsInterface,
): DefenseSetupCalculationsComposable {
    const { getDamageType } = useDefenseDamageType()
    
    const defenseSetupComboBuffs = computed<number>((): number => {
        let comboModifier = 1

        if (!calculationConditions.setupModifiers.value) {
            return comboModifier
        }

        if (calculationConditions.setupModifiers.value.combos.ignite) {
            comboModifier *= 1.25
        }

        if (calculationConditions.setupModifiers.value.combos.shatter && getDamageType(defense).equals(DamageType.Earth)) {
            comboModifier *= 1.5
        }

        return comboModifier
    })
    
    const defenseSetupHeroBuffs = computed<number>((): number => {
        let heroBuffModifier = 1

        if (!calculationConditions.setupModifiers.value) {
            return heroBuffModifier
        }

        if (calculationConditions.setupModifiers.value.heroBuffs.callToArms && !defense.isBuffDefense) {
            let callToArmsMultiplier = 1.45;
            if (calculationConditions.setupModifiers.value.heroBuffs.callToArmsInspiredShout) {
                callToArmsMultiplier = 1.70
            }

            heroBuffModifier *= callToArmsMultiplier
        }

        if (calculationConditions.setupModifiers.value.heroBuffs.eruption && !defense.isBuffDefense) {
            let eruptionMultiplier = 1.3;
            if (calculationConditions.setupModifiers.value.heroBuffs.eruptionTwiceAsBright) {
                eruptionMultiplier = 2.12
            }

            heroBuffModifier *= eruptionMultiplier
        }

        return heroBuffModifier
    })
    
    const defenseSetupModifiers = computed<number>((): number => {
        let setupModifier = 1

        if (!calculationConditions.setupModifiers.value || !defense.defenseData) {
            return setupModifier;
        }

        // Armored enemies take 25% extra magical damage and 50% less damage from physical attacks
        if (calculationConditions.setupModifiers.value.laneMutators.armored) {
            if (!defense.defenseData.damageType.equals(DamageType.Physical)) {
                setupModifier *= 1.25
            } else {
                setupModifier *= .50
            }
        }

        // Reckless/Berserked enemies take 50% extra damage
        if (calculationConditions.setupModifiers.value.laneMutators.berserked) {
            setupModifier *= 1.50
        }
        if (calculationConditions.setupModifiers.value.laneMutators.reckless) {
            setupModifier *= 1.50
        }

        // Spellbreaker enemies take 25% extra physical 50% less magical damage
        if (calculationConditions.setupModifiers.value.laneMutators.spellbreaker) {
            if (defense.defenseData.damageType.equals(DamageType.Physical)) {
                setupModifier *= 1.25
            } else {
                setupModifier *= .50
            }
        }

        // Enemies with a soft spot have 20% extra resistance
        if (calculationConditions.setupModifiers.value.laneMutators.softSpot) {
            setupModifier *= .80
        }

        // If enemies are frost enemies, they take +100% extra fire damage and -50% water damage
        if (calculationConditions.setupModifiers.value.enemyType?.frost) {
            if (getDamageType(defense).equals(DamageType.Fire)) {
                setupModifier *= 2
            }

            if (getDamageType(defense).equals(DamageType.Water)) {
                setupModifier *= .50
            }
        }

        return setupModifier
    })

    return { defenseSetupComboBuffs, defenseSetupHeroBuffs, defenseSetupModifiers }
}
