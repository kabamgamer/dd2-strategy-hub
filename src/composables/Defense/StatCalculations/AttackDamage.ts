import { computed, reactive, ref } from 'vue';

import type { ComputedRef, Ref, UnwrapNestedRefs } from 'vue';
import type { DefenseRootInterface, DefenseStatInterface, ModInterface, ShardInterface } from '@/types';
import type { UserDataStoreDefenseInterface } from '@/stores/UserData';
import type { CalculationConditionsInterface } from '@/composables/Defense/DefenseCalculations';
import type OutputModifier from '@/classes/OutputModifier';
import { useDefenseCalculations } from '@/composables/Defense/DefenseCalculations';
import useAncientPowers from '@/composables/Defense/AncientPowers';
import useModsShards from '@/composables/Defense/StatCalculations/ModsShards';
import useSetupCalculations, { SetupModifierCalculation } from '@/composables/Defense/StatCalculations/SetupModifiers';
import ExplosiveGuardStat from '@/defense_stats/ExplosiveGuardStat';
import ShieldingGuardStat from '@/defense_stats/ShieldingGuardStat';
import BlazingPhoenixStat from '@/defense_stats/BlazingPhoenixStat';
import useDefenseDamageType from '@/composables/Defense/DefenseDamageType';
import DamageType from '@/enums/DamageType';
import UserDefense from '@/classes/UserDefense';

export interface DefenseAttackDamageCalculationsComposable {
    tooltipAttackDamage: ComputedRef<number>,
    nonTooltipAttackDamageBonus: ComputedRef<number>,
    totalAttackDamage: UnwrapNestedRefs<{ nonCrit: number, crit: number }>,
    defenseSpecificStats: ComputedRef<DefenseStatInterface<any>[]>,
}

export default function useAttackDamageCalculations(
    defense: UserDataStoreDefenseInterface,
    defensePower: Ref<number>,
    defenseRange: Ref<number>,
    calculationConditions: CalculationConditionsInterface,
    defensePowerAdditives: ComputedRef<number>,
    defenseHealthAdditives: ComputedRef<number>,
    vampiricHealth: ComputedRef<number>,
    criticalMultiplier: ComputedRef<number>,
    criticalDamage: ComputedRef<number>,
): DefenseAttackDamageCalculationsComposable {
    const { getDamageType } = useDefenseDamageType()
    const { ancientDestructionMultiplier, ancientFortificationMultiplier } = useAncientPowers()
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
        forRegularModsAndShards('damageModifier', (util: ModInterface|ShardInterface, damageModifier: OutputModifier) => {
            if (!util.inTooltip) {
                return
            }

            bonusAttackDamage += damageModifier.additive ?? 0
            if (damageModifier.percentage) {
                attackDamageMultiplier += damageModifier.percentage / 100
            }
        })

        return Math.abs(baseAttackDamage * attackDamageMultiplier + bonusAttackDamage);
    })

    const totalAttackDamage = reactive<{crit: number, nonCrit: number}>({
        crit: 0,
        nonCrit: 0,
    })
    const nonTooltipAttackDamageMupltiplier = ref<number>(1)
    const nonTooltipAttackDamageBonus = computed<number>((): number => {
        let criticalDamageMultiplier: number = 1 + criticalDamage.value / 100
        totalAttackDamage.nonCrit = tooltipAttackDamage.value
        totalAttackDamage.crit = tooltipAttackDamage.value * criticalDamageMultiplier

        let bonusAttackDamage = 0
        let attackDamageMultiplier = 0
        forRegularModsAndShards('damageModifier', (util: ModInterface|ShardInterface, damageModifier: OutputModifier) => {
            if (util.inTooltip) {
                return
            }

            const criticalDivision: number = damageModifier.mutators.noCrit ? criticalMultiplier.value : 1
            criticalDamageMultiplier = damageModifier.mutators.noCrit ? 1 : criticalDamageMultiplier

            if (damageModifier.mutators.fromPower) {
                const powerDamageBonus: number = attackDamageFromPower(damageModifier)
                bonusAttackDamage += powerDamageBonus / criticalDivision
                totalAttackDamage.nonCrit += powerDamageBonus
                totalAttackDamage.crit += powerDamageBonus * criticalDamageMultiplier
                return
            }

            if (damageModifier.mutators.fromHealth) {
                const healthDamageBonus: number = attackDamageFromHealth(damageModifier)
                bonusAttackDamage += healthDamageBonus / criticalDivision
                totalAttackDamage.nonCrit += healthDamageBonus
                totalAttackDamage.crit += healthDamageBonus * criticalDamageMultiplier
                return
            }

            bonusAttackDamage += (damageModifier.additive ?? 0) / criticalDivision
            if (damageModifier.percentage) {
                if (damageModifier.mutators.scalesOff?.toLowerCase() === 'range') {
                    attackDamageMultiplier += damageModifier.percentage / 100 * (defenseRange.value / (defense.defenseData?.maxAttackRange ?? 0)) / criticalDivision
                    return
                }

                attackDamageMultiplier += damageModifier.percentage / 100 / criticalDivision
            }
        })

        nonTooltipAttackDamageMupltiplier.value = 1 + attackDamageMultiplier
        bonusAttackDamage *= nonTooltipAttackDamageMupltiplier.value
        totalAttackDamage.nonCrit *= nonTooltipAttackDamageMupltiplier.value
        totalAttackDamage.crit *= nonTooltipAttackDamageMupltiplier.value
        return tooltipAttackDamage.value * attackDamageMultiplier + bonusAttackDamage;
    })
    
    const defenseSpecificStats = computed<DefenseStatInterface<any>[]>(() => {
        const resolvedDefenseSpecificStats: DefenseStatInterface<any>[] = []

        if (!defense.defenseData) return resolvedDefenseSpecificStats

        let shard: ShardInterface|undefined
        shard = defense.userShards.find((shard: ShardInterface) => shard.id === 'shielding_guard')
        if (shard) {
            resolvedDefenseSpecificStats.push(new ShieldingGuardStat(parseFloat(shard.customOptions ?? '0'), defense, defenseHealthAdditives.value, calculationConditions.defenseLevel.value))
        }

        shard = defense.userShards.find((shard: ShardInterface) => shard.id === 'explosive_shielding_guard')
        if (shard) {
            const shardValues: {shield: number, explosion: number} = JSON.parse(shard.customOptions ?? '{}')
            resolvedDefenseSpecificStats.push(new ExplosiveGuardStat(shardValues.explosion, defense, calculationConditions, defenseHealthAdditives.value, calculationConditions.defenseLevel.value, "ESG Explosion"))
            resolvedDefenseSpecificStats.push(new ShieldingGuardStat(shardValues.shield, defense, defenseHealthAdditives.value, calculationConditions.defenseLevel.value, "ESG Shield"))
        }

        shard = defense.userShards.find((shard: ShardInterface) => shard.id === 'blazing_phoenix')
        if (shard) {
            resolvedDefenseSpecificStats.push(new BlazingPhoenixStat(defense, calculationConditions, defensePowerAdditives, criticalMultiplier, criticalDamage, shard, nonTooltipAttackDamageMupltiplier.value))
        }
        
        // From "non base damage" (eg. poison from poison defenses)
        defense.defenseData.children?.forEach((childDefenseData: DefenseRootInterface) => {
            const defenseClone = new UserDefense({
                incrementId: defense.incrementId,
                defenseData: childDefenseData,
                userData: { ...defense.userData, 'id': childDefenseData.id },
                userMods: defense.userMods,
                userShards: defense.userShards,
            }, defense.userData.id)

            const { 
                attackRate: elementalAttackRate, 
                totalDps: elementalTotalDps,
                totalAttackDamage: elementalTotalAttackDamage,
            } = useDefenseCalculations(defenseClone, calculationConditions)

            if (childDefenseData.baseAttackRate !== defense.defenseData?.baseAttackRate || childDefenseData.maxAttackRate !== defense.defenseData?.maxAttackRate) {
                resolvedDefenseSpecificStats.push({
                    label: childDefenseData.name + ' Rate',
                    value: elementalAttackRate.value.toFixed(2).toLocaleString('en-US'),
                })
            }

            resolvedDefenseSpecificStats.push({
                label: childDefenseData.name + ' DPS',
                tooltipDps: (elementalTotalDps.value / criticalMultiplier.value),
                dps: elementalTotalDps.value,
                value: Math.round(elementalTotalDps.value).toLocaleString('en-US'),
                attackDamage: elementalTotalAttackDamage.nonCrit,
                critDamage: elementalTotalAttackDamage.crit,
            })
        })

        return [...resolvedDefenseSpecificStats, ...dynamicCustomStats()]
    })

    function dynamicCustomStats(): DefenseStatInterface<any>[] {
        const resolvedDefenseSpecificStats: DefenseStatInterface<any>[] = []

        forRegularModsAndShards('damageModifier', (util: ModInterface|ShardInterface, damageModifier: OutputModifier) => {
            if (!damageModifier.mutators.customStat) {
                return
            }

            const damageModifierClone: OutputModifier = Object.assign(Object.create(Object.getPrototypeOf(damageModifier)), damageModifier)
            damageModifierClone.percentage = damageModifier.mutators.customStat
            const effectiveCriticalMultiplier: number = damageModifierClone.mutators.noCrit ? 1 : criticalMultiplier.value

            let customStatDamage: undefined|number
            if (damageModifierClone.mutators.fromPower) {
                customStatDamage = attackDamageFromPower(damageModifierClone)
            }

            if (damageModifierClone.mutators.fromHealth) {
                customStatDamage = attackDamageFromHealth(damageModifierClone)
            }

            if (!customStatDamage) {
                customStatDamage = (damageModifierClone.additive ?? 0)
                if (damageModifierClone.percentage) {
                    customStatDamage += damageModifierClone.percentage / 100
                }
            }

            const customStatDamageType = damageModifierClone.mutators.asDamageType ? new DamageType(damageModifierClone.mutators.asDamageType) : getDamageType(defense)

            customStatDamage *= nonTooltipAttackDamageMupltiplier.value * effectiveCriticalMultiplier
            customStatDamage *= SetupModifierCalculation.getSetupBonusMultiplier(calculationConditions.setupDefenses, calculationConditions.setupModifiers, customStatDamageType)
            const customStatCalculations = {
                label: util.name,
                value: Math.round(customStatDamage).toLocaleString('en-US'),
                critDamage: undefined as undefined|number,
                attackDamage: undefined as undefined|number,
            };

            if (!damageModifierClone.mutators.noCrit) {
                customStatCalculations.attackDamage = customStatDamage / effectiveCriticalMultiplier
                customStatCalculations.critDamage = customStatCalculations.attackDamage * (1 + criticalDamage.value / 100)
            }
            resolvedDefenseSpecificStats.push(customStatCalculations)
        })

        return resolvedDefenseSpecificStats
    }

    function attackDamageFromPower(damageModifier: OutputModifier): number {
        if (!damageModifier.mutators.fromPower) {
            return 0
        }

        const damageModifierMultiplier: number = (damageModifier.percentage ?? 0) / 100

        let powerValue: number = ((defense.defenseData?.baseDefensePower ?? 0) + defense.userData.relic.defensePower + defense.userData.pet.defensePower);
        if (damageModifier.mutators.fromPower.ancientDestructionBonus) {
            powerValue = fromAncientBonus('defensePower', damageModifier.mutators.fromPower.ancientDestructionBonus)
        }

        powerValue += defensePowerAdditives.value

        if (damageModifier.mutators.fromPower.skipAscension) {
            powerValue -= defense.ascensionDefensePower
        }
        
        if (!damageModifier.mutators.noUpgradeScaling) {
            const currentAttackScalar: number = defense.defenseData?.attackScalar[calculationConditions.defenseLevel.value-1] ?? 1
            const tier1AttackScalar: number = defense.defenseData?.attackScalar[0] ?? 1
            powerValue += powerValue * (currentAttackScalar / tier1AttackScalar - 1)
        }
        return powerValue * damageModifierMultiplier
    }

    function attackDamageFromHealth(damageModifier: OutputModifier): number {
        if (!damageModifier.mutators.fromHealth) {
            return 0
        }

        const damageModifierMultiplier: number = (damageModifier.percentage ?? 0) / 100
        if (damageModifier.mutators.fromHealth.vampiric) {
            return vampiricHealth.value * damageModifierMultiplier
        }

        let healthValue: number = ((defense.defenseData?.baseDefenseHealth ?? 0) + defense.userData.relic.defenseHealth + defense.userData.pet.defenseHealth);
        if (damageModifier.mutators.fromHealth.ancientFortificationBonus) {
            healthValue = fromAncientBonus('defenseHealth', damageModifier.mutators.fromHealth.ancientFortificationBonus)
        }

        healthValue += defenseHealthAdditives.value

        if (damageModifier.mutators.fromHealth.skipAscension) {
            healthValue -= defense.ascensionDefenseHealth
        }

        if (damageModifier.mutators.fromHealth.excludePowerTransfer !== true) {
            const powerTransferShard: ShardInterface|undefined = defense.userShards.find((shard: ShardInterface) => shard.id === 'power_transfer')
            healthValue *= (1 + ((powerTransferShard?.defenseHealth?.percentage ?? 0) / 100))
        }
        
        if (!damageModifier.mutators.noUpgradeScaling) {
            const currentHeatlhScalar: number = defense.defenseData?.hpScalar[calculationConditions.defenseLevel.value-1] ?? 1
            const tier1HeatlhScalar: number = defense.defenseData?.hpScalar[0] ?? 1
            healthValue += healthValue * (currentHeatlhScalar / tier1HeatlhScalar - 1)
        }
        return healthValue * damageModifierMultiplier
    }

    function fromAncientBonus(stat: 'defensePower'|'defenseHealth', ancientBonusStats: string[]): number {
        let petStat: number = defense.userData.pet[stat]
        let relicStat: number = defense.userData.relic[stat]
        let baseStat: number = defense.defenseData ? defense.defenseData[`base${stat.charAt(0).toUpperCase() + stat.slice(1)}` as 'baseDefenseHealth'|'baseDefensePower'] ?? 0 : 0;

        let ancientBonus: number = 0
        ancientBonusStats.forEach((stat: string) => {
            switch (stat) {
                case 'pet':
                    ancientBonus += petStat
                    petStat = 0
                    break
                case 'relic':
                    ancientBonus += relicStat
                    relicStat = 0
                    break
                case 'base':
                    ancientBonus += baseStat
                    baseStat = 0
                    break
            }
        })
        ancientBonus *= stat === 'defensePower' ? ancientDestructionMultiplier.value : ancientFortificationMultiplier.value
        ancientBonus += petStat + relicStat + baseStat

        return ancientBonus
    }

    return { tooltipAttackDamage, nonTooltipAttackDamageBonus, defenseSpecificStats, totalAttackDamage }
}
