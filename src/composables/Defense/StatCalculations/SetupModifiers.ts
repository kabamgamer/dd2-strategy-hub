import { computed } from 'vue';

import type { ComputedRef, Ref } from 'vue';
import type { UserDataStoreDefenseInterface } from '@/stores/UserData';
import type { CalculationConditionsInterface } from '@/composables/Defense/DefenseCalculations';
import type { DefenseSetupModifiersInterface, ModInterface, ShardInterface } from '@/types';
import useDefenseDamageType from "@/composables/Defense/DefenseDamageType";
import DamageType from '@/enums/DamageType';
import StatusEffect from '@/enums/StatusEffect';

interface DefenseSetupCalculationsComposable {
    defenseSetupComboBuffs: ComputedRef<number>,
    defenseSetupHeroBuffs: ComputedRef<number>,
    defenseSetupModifiers: ComputedRef<number>,
}

export class SetupModifierCalculation {
    public static getSetupBonusMultiplier(setupDefenses: Ref<undefined | UserDataStoreDefenseInterface[]>, setupModifiers: Ref<undefined | DefenseSetupModifiersInterface>, damageType: DamageType): number {
        return this.getSetupComboBuffsModifier(setupDefenses, setupModifiers, damageType) * this.getSetupModifierForDamageType(setupModifiers, damageType) * this.getSetupHeroBuffsModifier(setupModifiers)
    }

    public static getSetupComboBuffsModifier(setupDefenses: Ref<undefined | UserDataStoreDefenseInterface[]>, setupModifiers: Ref<undefined | DefenseSetupModifiersInterface>, damageType: DamageType): number {
        let comboModifier = 1

        if (!setupModifiers.value) {
            return comboModifier
        }

        if (setupModifiers.value.combos.ignite) {
            comboModifier *= 1.25
        }

        if (setupModifiers.value.combos.shatter && damageType.equals(DamageType.Earth)) {
            comboModifier *= 1.5
        }

        setupDefenses.value?.forEach((defense: UserDataStoreDefenseInterface) => {
            if (defense.isBuffDefense || !defense.defenseData) {
                return
            }
            
            if (defense.defenseData.statusEffects.contains(StatusEffect.Cripple)) {
                let crippleModifier: number = 1.25
                const spiritBlessingShard: undefined|ShardInterface = defense.userShards.find((shard) => shard.id === 'spirit_blessing')
                if (spiritBlessingShard) {
                    crippleModifier += parseFloat(spiritBlessingShard.customOptions ?? '0') / 100
                }

                comboModifier *= crippleModifier
            }

            [...defense.userMods, ...defense.userShards].forEach((util: ModInterface | ShardInterface) => {
                if (!util.damageModifier?.mutators.debuff) {
                    return
                }

                comboModifier *= 1 + (util.damageModifier.percentage ?? 0) / 100
            })
        })

        return comboModifier
    }

    public static getSetupModifierForDamageType(setupModifiers: Ref<undefined | DefenseSetupModifiersInterface>, damageType: DamageType): number {
        let setupModifier = 1

        if (!setupModifiers.value) {
            return setupModifier;
        }

        // Armored enemies take 25% extra magical damage and 50% less damage from physical attacks
        if (setupModifiers.value.laneMutators.armored) {
            if (!damageType.equals(DamageType.Physical)) {
                setupModifier *= 1.25
            } else {
                setupModifier *= .50
            }
        }

        // Reckless/Berserked enemies take 50% extra damage
        if (setupModifiers.value.laneMutators.berserked) {
            setupModifier *= 1.50
        }
        if (setupModifiers.value.laneMutators.reckless) {
            setupModifier *= 1.50
        }

        // Spellbreaker enemies take 25% extra physical 50% less magical damage
        if (setupModifiers.value.laneMutators.spellbreaker) {
            if (damageType.equals(DamageType.Physical)) {
                setupModifier *= 1.25
            } else {
                setupModifier *= .50
            }
        }

        // Enemies with a soft spot have 20% extra resistance
        if (setupModifiers.value.laneMutators.softSpot) {
            setupModifier *= .80
        }

        // If enemies are frost enemies, they take +100% extra fire damage and -50% water damage
        if (setupModifiers.value.enemyType?.frost) {
            if (damageType.equals(DamageType.Fire)) {
                setupModifier *= 2
            }

            if (damageType.equals(DamageType.Water)) {
                setupModifier *= .50
            }
        }

        return setupModifier
    }

    public static getSetupHeroBuffsModifier(setupModifiers: Ref<undefined | DefenseSetupModifiersInterface>): number {
        let heroBuffModifier = 1

        if (!setupModifiers.value) {
            return heroBuffModifier
        }

        if (setupModifiers.value.heroBuffs.callToArms) {
            let callToArmsMultiplier = 1.45;
            if (setupModifiers.value.heroBuffs.callToArmsInspiredShout) {
                callToArmsMultiplier = 1.70
            }

            heroBuffModifier *= callToArmsMultiplier
        }

        if (setupModifiers.value.heroBuffs.eruption) {
            let eruptionMultiplier = 1.3;
            if (setupModifiers.value.heroBuffs.eruptionTwiceAsBright) {
                eruptionMultiplier = 2.12
            }

            heroBuffModifier *= eruptionMultiplier
        }

        return heroBuffModifier
    }
}

export default function useSetupCalculations(
    defense: UserDataStoreDefenseInterface,
    calculationConditions: CalculationConditionsInterface,
): DefenseSetupCalculationsComposable {
    const { getDamageType } = useDefenseDamageType()
    
    const defenseSetupComboBuffs = computed<number>((): number => SetupModifierCalculation.getSetupComboBuffsModifier(calculationConditions.setupDefenses, calculationConditions.setupModifiers, getDamageType(defense)))
    
    const defenseSetupHeroBuffs = computed<number>((): number => {
        if (defense.isBuffDefense) {
            return 1
        }

        return SetupModifierCalculation.getSetupHeroBuffsModifier(calculationConditions.setupModifiers)
    })
    
    const defenseSetupModifiers = computed<number>((): number => {
        if (!defense.defenseData) {
            return 1;
        }

        return SetupModifierCalculation.getSetupModifierForDamageType(calculationConditions.setupModifiers, getDamageType(defense))
    })

    return { defenseSetupComboBuffs, defenseSetupHeroBuffs, defenseSetupModifiers }
}
