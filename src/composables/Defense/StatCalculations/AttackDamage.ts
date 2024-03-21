import { computed } from 'vue';

import type { ComputedRef, Ref } from 'vue';
import type { ModInterface, ShardInterface } from '@/types';
import type { UserDataStoreDefenseInterface } from '@/stores/UserData';
import type { CalculationConditionsInterface } from '@/composables/Defense/DefenseCalculations';
import type OutputModifier from '@/classes/OutputModifier';
import useAncientPowers from '@/composables/Defense/AncientPowers';
import useModsShards from '@/composables/Defense/StatCalculations/ModsShards';
import useSetupCalculations from '@/composables/Defense/StatCalculations/SetupModifiers';

interface DefenseAttackDamageCalculationsComposable {
    tooltipAttackDamage: ComputedRef<number>,
    nonTooltipAttackDamageBonus: ComputedRef<number>,
    nonCritAttackDamageBonus: ComputedRef<number>,
}

export default function useAttackDamageCalculations(
    defense: UserDataStoreDefenseInterface,
    defensePower: Ref<number>,
    calculationConditions: CalculationConditionsInterface,
    defensePowerAdditives: ComputedRef<number>,
    defenseHealthAdditives: ComputedRef<number>,
    vampiricHealth: ComputedRef<number>,
): DefenseAttackDamageCalculationsComposable {
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

    const nonTooltipAttackDamageBonus = computed<number>((): number => getAttackDamageBonus(tooltipAttackDamage.value))
    const nonCritAttackDamageBonus = computed<number>((): number => getAttackDamageBonus(tooltipAttackDamage.value, false))

    function getAttackDamageBonus(baseAttackDamage: number, includeCrits: boolean = true): number {
        let bonusAttackDamage = 0
        let attackDamageMultiplier = 0
        forRegularModsAndShards('damageModifier', (util: ModInterface|ShardInterface) => {
            if (util.inTooltip || !util.damageModifier) {
                return
            }

            if (util.damageModifier.mutators.noCrit && includeCrits) {
                return
            }

            if (util.damageModifier.mutators.fromPower) {
                bonusAttackDamage += attackDamageFromPower(util.damageModifier)
                return
            }

            if (util.damageModifier.mutators.fromHealth) {
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
        ancientBonus *= ancientDestructionMultiplier.value
        ancientBonus += petStat + relicStat + baseStat

        return ancientBonus
    }

    return { tooltipAttackDamage, nonTooltipAttackDamageBonus, nonCritAttackDamageBonus }
}
