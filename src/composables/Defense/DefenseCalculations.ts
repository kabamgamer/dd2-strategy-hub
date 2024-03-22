import { computed } from 'vue'

import type { Ref } from 'vue'
import type { CalculatedDefenseStatsInterface, DefenseSetupModifiersInterface, UserSetupDefenseInterface, DefenseStatInterface } from "@/types";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";

import useDefensePowerCalculations from '@/composables/Defense/StatCalculations/DefensePower';
import useDefenseHealthCalculations from '@/composables/Defense/StatCalculations/DefenseHealth';

import NetherArcherBouncesStat from "@/defense_stats/NetherArcherBouncesStat";
import useDefenseCriticalCalculations from './StatCalculations/DefenseCritical';
import useDefenseRateCalculations from './StatCalculations/DefenseRate';
import useDefenseRangeCalculations from './StatCalculations/DefenseRange';
import useSetupCalculations from './StatCalculations/SetupModifiers';
import useAttackDamageCalculations from './StatCalculations/AttackDamage';

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

    const { tooltipAttackDamage, nonTooltipAttackDamageBonus, defenseSpecificStats } = useAttackDamageCalculations(defense, defensePower, calculationConditions, defensePowerAdditives, defenseHealthAdditives, vampiricHealth, criticalMultiplier)
    const customStatsDps = computed<number>(() => defenseSpecificStats.value.reduce((acc: number, stat: DefenseStatInterface<any>) => acc + (stat.dps ?? 0), 0))

    const tooltipDps = computed<number>(() => tooltipAttackDamage.value * criticalMultiplier.value / attackRate.value)
    const totalDps = computed<number>(() => (tooltipAttackDamage.value + nonTooltipAttackDamageBonus.value) * defenseSetupComboBuffs.value * defenseSetupModifiers.value * criticalMultiplier.value / attackRate.value + customStatsDps.value)

    const defenseSpecificStatsDependingOnTotalDps = computed<DefenseStatInterface<any>[]>((): DefenseStatInterface<any>[] => {
        const resolvedDefenseSpecificStats: DefenseStatInterface<any>[] = []

        switch (defense.userData.id) {
            case 'NetherArcher':
                resolvedDefenseSpecificStats.push(new NetherArcherBouncesStat(totalDps, defense))
                break
        }

        return resolvedDefenseSpecificStats
    })

    // expose managed state as return value
    return { totalDps, tooltipDps, attackDamage: tooltipAttackDamage, attackRate, defensePower, defenseHealth, defenseHitPoints, defenseRange, criticalChance, criticalDamage, defenseSpecificStats: [...defenseSpecificStats.value, ...defenseSpecificStatsDependingOnTotalDps.value] }
}
