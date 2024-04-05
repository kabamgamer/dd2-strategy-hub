import { computed } from 'vue';

import type { ComputedRef } from 'vue';
import type { UserDataStoreDefenseInterface } from '@/stores/UserData';
import type { CalculationConditionsInterface } from '@/composables/Defense/DefenseCalculations';
import type { CalculatedDefenseStatsInterface, ModInterface, ShardInterface } from '@/types';
import useAncientPowers from '@/composables/Defense/AncientPowers';
import usePylonCalculations from '@/composables/Defense/PylonCalculations';
import useModsShards from './ModsShards';
import OutputModifier from '@/classes/OutputModifier';

interface DefenseCriticalCalculationsComposable {
    criticalChance: ComputedRef<number>
    criticalDamage: ComputedRef<number>
    criticalMultiplier: ComputedRef<number>
}

export default function useDefenseCriticalCalculations(
    defense: UserDataStoreDefenseInterface,
    calculationConditions: CalculationConditionsInterface,
): DefenseCriticalCalculationsComposable {
    const { ancientDefenseCriticalChance, ancientDefenseCriticalDamage } = useAncientPowers()
    const { pylonsModifier } = usePylonCalculations(defense, calculationConditions.setupDefenses)
    const { forRegularModsAndShards, diverseValueForStat } = useModsShards(defense, calculationConditions)

    const criticalChance = computed<number>((): number => {
        // 30% is the base crit chance (including 20% ascension crit chance)
        let critChance: number = 30;
        
        // Poison damage is not affected by ascension crit chance and mods/shards/godly stats
        if (defense.parent === 'Pufferfish') {
            return 10;
        }

        forRegularModsAndShards('criticalChance', (util: ModInterface | ShardInterface, criticalChanceModifier: OutputModifier) => {
            critChance += criticalChanceModifier.percentage ?? 0
        })

        critChance += diverseValueForStat('criticalChance', 'percentage');

        if (defense.userData.relic.godlyStat?.type === 'critical_chance') {
            critChance += defense.userData.relic.godlyStat.value
        }

        if (calculationConditions.setupModifiers.value && calculationConditions.setupModifiers.value.heroBuffs.radiantCriticalPower > 0) {
            critChance += 3 * (calculationConditions.setupModifiers.value.heroBuffs.radiantCriticalPower > 4 ? 4 : calculationConditions.setupModifiers.value.heroBuffs.radiantCriticalPower)
        }

        critChance += pylonsModifier('criticalChance')
        critChance += ancientDefenseCriticalChance.value

        return critChance > 100 ? 100 : critChance
    })

    const criticalDamage = computed<number>((): number => {
        // 50% is the base crit damage
        let criticalDamagePercentage: number = 50;

        if (!defense.isBuffDefense) {
            // Add all the crit damage boosts from other defenses
            criticalDamagePercentage += Object.values(calculationConditions.defenseBoosts.value ?? {}).reduce((total: number, defenseBoost: CalculatedDefenseStatsInterface) => total + defenseBoost.critDamage, 0)
        }
        
        // Pufferfish' poison damage is not affected by ascension crit damage and mods/shards/godly stats
        if (defense.parent === 'Pufferfish') {
            return 30;
        }

        if (!defense.defenseData) {
            return criticalDamagePercentage
        }

        forRegularModsAndShards('criticalDamage', (util: ModInterface | ShardInterface, criticalDamageModifier: OutputModifier) => {
            criticalDamagePercentage += criticalDamageModifier.percentage ?? 0
        })

        criticalDamagePercentage += diverseValueForStat('criticalDamage', 'percentage');

        if (defense.userData.relic.godlyStat?.type === 'critical_damage') {
            criticalDamagePercentage += defense.userData.relic.godlyStat.value
        }

        if (calculationConditions.setupModifiers.value) {
            if (calculationConditions.setupModifiers.value.heroBuffs.radiantCriticalPower > 0) {
                criticalDamagePercentage += 5 * (calculationConditions.setupModifiers.value.heroBuffs.radiantCriticalPower > 4 ? 4 : calculationConditions.setupModifiers.value.heroBuffs.radiantCriticalPower)
            }
    
            if (calculationConditions.setupModifiers.value.heroBuffs.talisman && !defense.isBuffDefense) {
                criticalDamagePercentage += 20
    
                if (calculationConditions.setupModifiers.value.heroBuffs.talismanChiBurst) {
                    criticalDamagePercentage += 26
                }
            }
        }

        criticalDamagePercentage += pylonsModifier('criticalDamage')
        criticalDamagePercentage += ancientDefenseCriticalDamage.value

        if (defense.isBuffDefense) {
            const currentAttackScalar: number = defense.defenseData.attackScalar[calculationConditions.defenseLevel.value-1]
            const firstAttackScalar: number = defense.defenseData.attackScalar[0]
            criticalDamagePercentage += criticalDamagePercentage * (currentAttackScalar / firstAttackScalar - 1)
        }

        return criticalDamagePercentage
    })

    const criticalMultiplier = computed<number>((): number => {
        const critChanceMultiplier: number = criticalChance.value / 100
        const criticalDamageMultiplier: number = criticalDamage.value / 100

        return 1 + critChanceMultiplier * criticalDamageMultiplier
    })

    return { criticalChance, criticalDamage, criticalMultiplier }
}
