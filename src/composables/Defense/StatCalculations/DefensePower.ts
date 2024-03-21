import { computed } from 'vue';

import type { ComputedRef } from 'vue';
import type { UserDataStoreDefenseInterface } from '@/stores/UserData';
import type { CalculationConditionsInterface } from '@/composables/Defense/DefenseCalculations';
import type { ModInterface, ShardInterface } from '@/types';
import useAncientPowers from '@/composables/Defense/AncientPowers';
import usePylonCalculations from '@/composables/Defense/PylonCalculations';
import useModsShards from '@/composables/Defense/StatCalculations/ModsShards';

interface DefensePowerCalculationsComposable {
    defensePower: ComputedRef<number>
    defensePowerAdditives: ComputedRef<number>
    defensePowerMultiplier: ComputedRef<number>
}

export default function useDefensePowerCalculations(
    defense: UserDataStoreDefenseInterface,
    calculationConditions: CalculationConditionsInterface,
    vampiricHealth: ComputedRef<number>,
): DefensePowerCalculationsComposable {
    const { ancientDestructionMultiplier } = useAncientPowers()
    const { forRegularModsAndShards, diverseValueForStat } = useModsShards(defense, calculationConditions)

    const defensePowerSetupBoosts = computed<number>((): number => {
        let boostedPower: number = 0;

        if (!calculationConditions.defenseBoosts.value) {
            return boostedPower
        }

        for (const defenseBoostIncrementId in calculationConditions.defenseBoosts.value) {
            if (parseInt(defenseBoostIncrementId) === defense.userData.incrementId) {
                continue
            }

            boostedPower += calculationConditions.defenseBoosts.value[defenseBoostIncrementId].defensePower
        }

        return boostedPower
    })

    const defensePowerAdditives = computed<number>((): number => {
        let additiveValues = 0

        if (!defense.defenseData) {
            return 0
        }

        additiveValues += defense.ascensionDefensePower
        additiveValues += vampiricEmpowerment.value
        additiveValues += diverseValueForStat('defensePower', 'additive');

        forRegularModsAndShards('defensePower', (util: ModInterface|ShardInterface): void => {
            additiveValues += util.defensePower?.additive ?? 0
        })
        
        if (!defense.isBuffDefense) {
            additiveValues += defensePowerSetupBoosts.value
        }

        return additiveValues
    })

    const defensePowerMultiplier = computed<number>((): number => {
        let multiplier: number = 1

        if (!defense.defenseData) {
            return multiplier
        }
        
        const hasDestruction: boolean = defense.userShards.find((shard: ShardInterface) => shard.id === 'destruction') !== undefined;
        const hasMassDestruction: boolean = defense.userShards.find((shard: ShardInterface) => shard.id === 'mass_destruction') !== undefined;
        const boostedPowerShard: ShardInterface|undefined = defense.userShards.find((shard: ShardInterface) => shard.id === 'boosted_power');
        const boostedBeamShard: ShardInterface|undefined = defense.userShards.find((shard: ShardInterface) => shard.id === 'boosted_beam');

        // Calculate percentage modifiers
        forRegularModsAndShards('defensePower', (util: ModInterface|ShardInterface): void => {
            if (!util.defensePower?.percentage) {
                return
            }

            if (util.id === 'destructive_pylon' && !hasDestruction) {
                multiplier *= 1.34;
            }

            if (util.defensePower?.mutators.pylon) {
                return
            }

            if (util.id === 'boosted_power' && hasMassDestruction) {
                return
            }

            if (util.id === 'boosted_beam' && hasMassDestruction) {
                return
            }

            if (util.id === 'mass_destruction' && boostedPowerShard) {
                multiplier *= (1 + (util.defensePower.percentage + (boostedPowerShard.defensePower?.percentage ?? 0)) / 100)
                return
            }

            if (util.id === 'mass_destruction' && boostedBeamShard) {
                multiplier *= (1 + (util.defensePower.percentage + (boostedBeamShard.defensePower?.percentage ?? 0)) / 100)
                return
            }

            if (util.id === 'motherly_instinct') {
                multiplier *= motherlyInstinctModifier(util.defensePower.percentage ?? 0)

                return;
            }

            multiplier *= 1 + util.defensePower.percentage / 100
        }, true)

        if (calculationConditions.setupModifiers.value) {
            // Add 14% defense power per radiant power shard
            if (calculationConditions.setupModifiers.value.heroBuffs.radiantPower > 0) {
                for (let i = 0; i < (calculationConditions.setupModifiers.value.heroBuffs.radiantPower > 4 ? 4 : calculationConditions.setupModifiers.value.heroBuffs.radiantPower); i++) {
                    multiplier *= 1.14
                }
            }
    
            if (calculationConditions.setupModifiers.value.heroBuffs.talisman && !defense.isBuffDefense) {
                // Add 60% defense power if talisman is active
                multiplier *= 1.60
    
                if (calculationConditions.setupModifiers.value.heroBuffs.talismanChiSupercharge) {
                    // Add an additional 26% defense power if talisman is active and has a chi supercharge shard
                    multiplier *= 1.26
                }
            }
        }

        multiplier *= 1 + usePylonCalculations(defense, calculationConditions.setupDefenses).pylonsModifier('defensePower') / 100

        return multiplier
    })
    
    const defensePower = computed<number>((): number => {
        if (!defense.defenseData?.baseDefensePower) {
            return 0
        }

        let totalDefensePower: number = defense.defenseData.baseDefensePower + defense.userData.relic.defensePower + defense.userData.pet.defensePower;

        totalDefensePower *= ancientDestructionMultiplier.value
        totalDefensePower += defensePowerAdditives.value
        totalDefensePower *= defensePowerMultiplier.value

        if (defense.isBuffDefense) {
            const currentAttackScalar: number = defense.defenseData.attackScalar[calculationConditions.defenseLevel.value-1]
            const tier1AttackScalar: number = defense.defenseData.attackScalar[0]
            totalDefensePower += totalDefensePower * (currentAttackScalar / tier1AttackScalar - 1)
        }

        return totalDefensePower
    })

    const vampiricEmpowerment = computed<number>((): number => {
        if (!defense.defenseData) {
            return 0
        }

        const vampiricEmpowermentShard: ShardInterface|undefined = defense.userShards.find((shard: ShardInterface) => shard.id === 'vampiric_empowerment')
        if (!vampiricEmpowermentShard) {
            return 0
        }

        const vampiricEmpowermentHealthPercentage: number = (parseFloat(vampiricEmpowermentShard.customOptions ?? '0')) / 100
        return vampiricHealth.value * vampiricEmpowermentHealthPercentage
    })

    function motherlyInstinctModifier(percentage: number): number {
        if (!calculationConditions.setupDefenses.value || !calculationConditions.setupDefenseOptions.value) {
            return 1
        }

        let dragonsNestsCount: number = 0
        calculationConditions.setupDefenses.value.forEach((setupDefense: UserDataStoreDefenseInterface) => {
            if (setupDefense.userData.id === 'Dragon\'sNest') {
                // @ts-ignore
                dragonsNestsCount += calculationConditions.setupDefenseOptions.value[setupDefense.incrementId].defenseCount
            }
        })

        let motherlyInstinctDefensePowerMultiplier: number = 1
        // Add defense power per dragons nest
        for (let i = 0; i < dragonsNestsCount; i++) {
            motherlyInstinctDefensePowerMultiplier += (percentage / 100)
        }

        return motherlyInstinctDefensePowerMultiplier
    }

    return { defensePower, defensePowerAdditives, defensePowerMultiplier }
}
