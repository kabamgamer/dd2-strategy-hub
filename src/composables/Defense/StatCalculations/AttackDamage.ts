import { computed } from 'vue';

import type { ComputedRef, Ref } from 'vue';
import type { ModInterface, ShardInterface } from '@/types';
import type { UserDataStoreDefenseInterface } from '@/stores/UserData';
import type { CalculationConditionsInterface } from '@/composables/Defense/DefenseCalculations';
import type OutputModifier from '@/classes/OutputModifier';
import useModsShards from '@/composables/Defense/StatCalculations/ModsShards';
import useSetupCalculations from '@/composables/Defense/StatCalculations/SetupModifiers';

interface DefenseAttackDamageCalculationsComposable {
    tooltipAttackDamage: ComputedRef<number>,
    nonTooltipAttackDamageBonus: ComputedRef<number>,
}

export default function useAttackDamageCalculations(
    defense: UserDataStoreDefenseInterface,
    defensePower: Ref<number>,
    calculationConditions: CalculationConditionsInterface,
    defensePowerAdditives: ComputedRef<number>,
    defenseHealthAdditives: ComputedRef<number>,
    vampiricHealth: ComputedRef<number>,
): DefenseAttackDamageCalculationsComposable {
    const { forRegularModsAndShards } = useModsShards(defense, calculationConditions)
    const { defenseSetupHeroBuffs } = useSetupCalculations(defense, calculationConditions)

    const tooltipAttackDamage = computed<number>((): number => {
        if (!defense.defenseData) {
            return 0
        }
        
        if (defense.isBuffDefense) {
            return 0
        }

        const attackScalar: number = defense.defenseData?.attackScalar[calculationConditions.defenseLevel.value-1]
        const baseAttackDamage = defensePower.value * attackScalar * defenseSetupHeroBuffs.value

        let bonusAttackDamage = 0
        let attackDamageMultiplier = 1
        forRegularModsAndShards('damageModifier', (util: ModInterface|ShardInterface) => {
            if (!util.inTooltip || !util.damageModifier) {
                return
            }

            bonusAttackDamage += util.damageModifier.additive ?? 0
            if (util.damageModifier.percentage) {
                attackDamageMultiplier += util.damageModifier.percentage / 100
            }
        })

        return baseAttackDamage * attackDamageMultiplier + bonusAttackDamage;
    })

    const nonTooltipAttackDamageBonus = computed<number>((): number => {
        const baseAttackDamage =  tooltipAttackDamage.value

        let bonusAttackDamage = 0
        let attackDamageMultiplier = 0
        forRegularModsAndShards('damageModifier', (util: ModInterface|ShardInterface) => {
            if (util.inTooltip || !util.damageModifier) {
                return
            }

            if (util.damageModifier?.mutators.fromHealth) {
                bonusAttackDamage += attackDamageFromHealth(util.damageModifier)
                return
            }

            bonusAttackDamage += util.damageModifier.additive ?? 0
            if (util.damageModifier.percentage) {
                attackDamageMultiplier += util.damageModifier.percentage / 100
            }
        })

        bonusAttackDamage *= 1 + attackDamageMultiplier
        return baseAttackDamage * attackDamageMultiplier + bonusAttackDamage;
    })

    function attackDamageFromHealth(damageModifier: OutputModifier): number {
        const damageModifierMultiplier: number = (damageModifier.percentage ?? 0) / 100
        if (damageModifier.mutators.fromHealth?.vampiric) {
            return vampiricHealth.value * damageModifierMultiplier
        }
        
        let healthValue: number = ((defense.defenseData?.baseDefenseHealth ?? 0) + defense.userData.relic.defenseHealth + defense.userData.pet.defenseHealth + defenseHealthAdditives.value);

        const currentHeatlhScalar: number = defense.defenseData?.hpScalar[calculationConditions.defenseLevel.value-1] ?? 1
        const tier1HeatlhScalar: number = defense.defenseData?.hpScalar[0] ?? 1
        healthValue += healthValue * (currentHeatlhScalar / tier1HeatlhScalar - 1)
        return healthValue * damageModifierMultiplier
    }

    return { tooltipAttackDamage, nonTooltipAttackDamageBonus }
}
