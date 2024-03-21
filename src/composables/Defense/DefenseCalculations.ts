import { computed } from 'vue'

import type { Ref } from 'vue'
import type { ModInterface, ShardInterface, CalculatedDefenseStatsInterface, DefenseSetupModifiersInterface, UserSetupDefenseInterface, DefenseStatInterface } from "@/types";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";

import useDefensePowerCalculations from '@/composables/Defense/StatCalculations/DefensePower';
import useDefenseHealthCalculations from '@/composables/Defense/StatCalculations/DefenseHealth';

import NetherArcherBouncesStat from "@/defense_stats/NetherArcherBouncesStat";
import BlazingPhoenixStat from '@/defense_stats/BlazingPhoenixStat';
import useDefenseCriticalCalculations from './StatCalculations/DefenseCritical';
import useDefenseRateCalculations from './StatCalculations/DefenseRate';
import useDefenseRangeCalculations from './StatCalculations/DefenseRange';
import useSetupCalculations from './StatCalculations/SetupModifiers';
import useAttackDamageCalculations from './StatCalculations/AttackDamage';
import ExplosiveGuardStat from '@/defense_stats/ExplosiveGuardStat';
import ShieldingGuardStat from '@/defense_stats/ShieldingGuardStat';

export interface CalculationConditionsInterface {
    defenseLevel: Ref<number>,
    setupDefenses: Ref<undefined | UserDataStoreDefenseInterface[]>,
    setupDefenseOptions: Ref<undefined | { [defensesIncrementId: number]: UserSetupDefenseInterface }>,
    defenseBoosts: Ref<undefined | { [incrementId: number]: CalculatedDefenseStatsInterface }>,
    setupModifiers: Ref<undefined | DefenseSetupModifiersInterface>,
}

export function useDefenseCalculations(
    defense: UserDataStoreDefenseInterface,
    defenseLevel: Ref<number>,
    setupDefenses: Ref<undefined | UserDataStoreDefenseInterface[]>,
    setupDefenseOptions: Ref<undefined | { [defensesIncrementId: number]: UserSetupDefenseInterface }>,
    defenseBoosts: Ref<undefined | { [incrementId: number]: CalculatedDefenseStatsInterface }>,
    setupModifiers: Ref<undefined | DefenseSetupModifiersInterface>,
): any {

    const calculationConditions: CalculationConditionsInterface = {
        defenseLevel,
        setupDefenses,
        setupDefenseOptions,
        defenseBoosts,
        setupModifiers,
    }

    const { defenseHealth, defenseHealthAdditives, vampiricHealth } = useDefenseHealthCalculations(defense, calculationConditions);
    const { defensePower, defensePowerAdditives } = useDefensePowerCalculations(defense, calculationConditions, vampiricHealth);
    const { criticalChance, criticalDamage, criticalMultiplier } = useDefenseCriticalCalculations(defense, calculationConditions);
    const { attackRate } = useDefenseRateCalculations(defense, calculationConditions)
    const { defenseRange } = useDefenseRangeCalculations(defense, calculationConditions)

    const { defenseSetupComboBuffs, defenseSetupModifiers } = useSetupCalculations(defense, calculationConditions)
    
    const defenseHitPoints = computed<number>(() => defenseHealth.value * (defense.defenseData?.hpScalar[defenseLevel.value - 1] ?? 0))

    const { tooltipAttackDamage, nonTooltipAttackDamageBonus, nonCritAttackDamageBonus } = useAttackDamageCalculations(defense, defensePower, calculationConditions, defensePowerAdditives, defenseHealthAdditives, vampiricHealth)

    const tooltipDps = computed<number>(() => tooltipAttackDamage.value * criticalMultiplier.value / attackRate.value)
    const totalDps = computed<number>(() => {
        const totalAttackDamage: number = tooltipAttackDamage.value + nonTooltipAttackDamageBonus.value
        let dps: number = totalAttackDamage * defenseSetupComboBuffs.value * defenseSetupModifiers.value * criticalMultiplier.value / attackRate.value
        dps += bouncingPhoenixStat.value?.dps ?? 0
        return dps + nonCritAttackDamageBonus.value
    })

    const bouncingPhoenixStat = computed<undefined|BlazingPhoenixStat>(() => {
        if (!getDefenseShardById('blazing_phoenix')) {
            return undefined
        }

        return new BlazingPhoenixStat(defense, defensePowerAdditives)
    })
    const defenseSpecificStats = computed<DefenseStatInterface<any>[]>(() => {
        const defaultConstructorParams: [Ref<number>, ModInterface[], ShardInterface[]] = [totalDps, defense.userMods, defense.userShards]
        const defenseSpecificStats: DefenseStatInterface<any>[] = []

        if (!defense.defenseData) return defenseSpecificStats

        switch (defense.defenseData.id) {
            case 'NetherArcher':
                defenseSpecificStats.push(new NetherArcherBouncesStat(...defaultConstructorParams))
                break
            case 'BlazeBalloon':
                if (bouncingPhoenixStat.value) {
                    defenseSpecificStats.push(bouncingPhoenixStat.value)
                }
        }

        let shard: ShardInterface|undefined
        shard = getDefenseShardById('explosive_guard')
        if (shard) {
            defenseSpecificStats.push(new ExplosiveGuardStat(parseFloat(shard.customOptions ?? '0'), defense, defenseHealthAdditives.value, calculationConditions.defenseLevel.value))
        }

        shard = getDefenseShardById('shielding_guard')
        if (shard) {
            defenseSpecificStats.push(new ShieldingGuardStat(parseFloat(shard.customOptions ?? '0'), defense, defenseHealthAdditives.value, calculationConditions.defenseLevel.value))
        }

        shard = getDefenseShardById('explosive_shielding_guard')
        if (shard) {
            const shardValues: {shield: number, explosion: number} = JSON.parse(shard.customOptions ?? '{}')
            defenseSpecificStats.push(new ExplosiveGuardStat(shardValues.explosion, defense, defenseHealthAdditives.value, calculationConditions.defenseLevel.value, "ESG Explosion"))
            defenseSpecificStats.push(new ShieldingGuardStat(shardValues.shield, defense, defenseHealthAdditives.value, calculationConditions.defenseLevel.value, "ESG Shield"))
        }

        return defenseSpecificStats
    })

    function getDefenseShardById(shardId: string): ShardInterface|undefined {
        return defense.userShards.find((shard: ShardInterface) => shard.id === shardId)
    }

    // expose managed state as return value
    return { totalDps, tooltipDps, attackDamage: tooltipAttackDamage, attackRate, defensePower, defenseHealth, defenseHitPoints, defenseRange, criticalChance, criticalDamage, defenseSpecificStats }
}
