import { ref } from 'vue'
import OutputModifier from "@/classes/OutputModifier";
import type { DefenseRootInterface, ModInterface, ShardInterface, UserDefenseInterface } from "@/interaces";
import type { UserAncientResetPoints } from "@/data/AncientPowers";
import {
    AncientDefenseCriticalChance,
    AncientDefenseCriticalDamage,
    AncientDestruction,
    AncientFortification
} from "@/data/AncientPowers";

import HasAscensionPoints from "@/traits/HasAscensionPoints";

import ModType from "@/enums/ModType";

export function useDefenseCalculations(): any {
    let defense: DefenseRootInterface
    let userDefenseData: UserDefenseInterface
    let defenseMods: ModInterface[]
    let defenseShards: ShardInterface[]
    let defenseLevel: number
    let ancientResetPoints: UserAncientResetPoints

    const totalDps = ref('')
    const defenseHealth = ref(0)
    const defensePower = ref(0)
    const criticalChance = ref(0)
    const criticalDamage = ref(0)

    function calculateDefensePower(parsedDefense: DefenseRootInterface, parsedUserDefenseData: UserDefenseInterface, parsedDefenseMods: ModInterface[], parsedDefenseShards: ShardInterface[], parsedDefenseLevel: number, parsedAncientResetPoints: UserAncientResetPoints): void {
        defense = parsedDefense
        userDefenseData = parsedUserDefenseData
        defenseMods = parsedDefenseMods
        defenseShards = parsedDefenseShards
        defenseLevel = parsedDefenseLevel
        ancientResetPoints = parsedAncientResetPoints

        defensePower.value = calculatedDefensePower()
        defenseHealth.value = calculatedDefenseHealth()
        criticalChance.value = calculatedCriticalChance()
        criticalDamage.value = calculatedCriticalDamage()
        totalDps.value = calculatedDps()
    }

    function calculatedDefenseHealth(): number {
        let totalDefenseHealth: number = userDefenseData.pet.defenseHealth * ancientFortificationMultiplier() + defense.baseDefenseHealth;

        totalDefenseHealth += userDefenseData.relic.defenseHealth ?? 0;

        totalDefenseHealth += ascensionDefenseHealth()

        return totalDefenseHealth
    }

    function calculatedDefensePower(): number {
        if (!defense.baseDefensePower) {
            return 0
        }

        const totalDefensePower: number = defense.baseDefensePower + userDefenseData.relic.defensePower + userDefenseData.pet.defensePower;

        let rangeGambitSubtraction = 0
        if (defense as any instanceof HasAscensionPoints) {
            rangeGambitSubtraction = (defense as unknown as HasAscensionPoints).defenseRangeAP?.setUpgradeLevel(userDefenseData.ascensionPoints.defense_range ?? 0)?.defensePower ?? 0;
        }

        return (totalDefensePower * ancientDestructionMultiplier() + ascensionDefensePower() + rangeGambitSubtraction + powerMods() + vampiricEmpowerment())
    }

    function calculatedCriticalChance(): number {
        // 30% is the base crit chance
        let critChance: number = 30;

        [...defenseMods, ...defenseShards].forEach((util: ModInterface | ShardInterface) => {
            if (util.criticalChance instanceof OutputModifier) {
                critChance += util.criticalChance.percentage ?? 0
            }
        })

        let critChanceMultiplier: number = critChance / 100

        // apply ancient reset points
        if (ancientResetPoints.ancient_defense_critical_chance > 0) {
            critChanceMultiplier += AncientDefenseCriticalChance.upgrades[ancientResetPoints.ancient_defense_critical_chance - 1]
        }

        return critChanceMultiplier > 1 ? 1 : critChanceMultiplier
    }

    function calculatedCriticalDamage(): number {
        // 50% is the base crit damage
        let criticalDamage: number = 50;

        [...defenseMods, ...defenseShards].forEach((util: ModInterface | ShardInterface) => {
            if (util.criticalDamage instanceof OutputModifier) {
                criticalDamage += util.criticalDamage.percentage ?? 0
            }
        })

        let criticalDamageMultiplier: number = criticalDamage / 100

        // apply ancient reset points
        if (ancientResetPoints.ancient_defense_critical_damage > 0) {
            criticalDamageMultiplier += AncientDefenseCriticalDamage.upgrades[ancientResetPoints.ancient_defense_critical_damage - 1]
        }

        return criticalDamageMultiplier
    }

    function calculatedDps(): string {
        const baseDefensePower: number = defensePower.value * destructionShardMultiplier() * massDestructionShardMultiplier() * destructivePylonMultiplier()
        const attackDamage: number = baseDefensePower * defense.attackScalar[defenseLevel-1]
        const baseDps: number = attackDamage * (1 + criticalChance.value * criticalDamage.value) / attackRate()
        const totalDps: number = baseDps * antiModsModifier()

        return Math.round(totalDps).toLocaleString('en-US')
    }

    function attackRate(): number {
        let attackRatePercentageBuffed: number = 0;

        [...defenseMods, ...defenseShards].forEach((util: ModInterface | ShardInterface) => {
            if (util.defenseRate instanceof OutputModifier) {
                attackRatePercentageBuffed += util.defenseRate.percentage ?? 0
            }
        })
        attackRatePercentageBuffed += ascensionDefenseRatePercentage();

        const attackRateMultiplier: number = 1 - attackRatePercentageBuffed / 100

        const calculatedAttackRate: number = defense.baseAttackRate * attackRateMultiplier;

        return calculatedAttackRate < defense.maxAttackRate ? defense.maxAttackRate : calculatedAttackRate
    }

    function ascensionDefenseRatePercentage(): number {
        if (!defense as any instanceof HasAscensionPoints) {
            return 0;
        }

        return (defense as unknown as HasAscensionPoints).defenseRateAP?.setUpgradeLevel(userDefenseData.ascensionPoints.defense_rate ?? 0)?.defenseRate ?? 0
    }

    function ascensionDefensePower(): number {
        if (!defense as any instanceof HasAscensionPoints) {
            return 0;
        }

        return (defense as unknown as HasAscensionPoints).defensePowerAP?.setUpgradeLevel(userDefenseData.ascensionPoints.defense_power ?? 0)?.defensePower ?? 0
    }

    function ascensionDefenseHealth(): number {
        if (!defense as any instanceof HasAscensionPoints) {
            return 0;
        }

        return (defense as unknown as HasAscensionPoints).defenseHealthAP?.setUpgradeLevel(userDefenseData.ascensionPoints.defense_health ?? 0)?.defenseHealth ?? 0
    }

    function vampiricEmpowerment(): number {
        if (userDefenseData.shards?.filter((shardId: string) => shardId === 'vampiric_empowerment').length === 0) {
            return 0
        }

        const vampiricEmpowermentBaseStat = ancientFortificationMultiplier() * userDefenseData.pet.defenseHealth + defense.baseDefenseHealth + userDefenseData.relic.defenseHealth + ascensionDefenseHealth()

        return vampiricEmpowermentBaseStat * .76
    }

    function destructionShardMultiplier(): number {
        const shards: string[] = userDefenseData.shards;

        return shards?.filter((shardId: string) => shardId === 'destruction').length === 0 ? 1 : 1.42
    }

    function massDestructionShardMultiplier(): number {
        const shards: string[] = userDefenseData.shards;

        return shards?.filter((shardId: string) => shardId === 'mass_destruction').length === 0 ? 1 : 1.70
    }

    function powerMods(): number {
        let powerModsAdditive: number = 0;

        defenseMods.forEach((mod: ModInterface): void => {
            if (mod.type !== ModType.Power) {
                return
            }

            powerModsAdditive += mod.defensePower?.additive ?? 0
        })

        return powerModsAdditive
    }

    function antiModsModifier(): number {
        let antiModsPercentage: number = 0;

        defenseMods.forEach((mod: ModInterface): void => {
            if (mod.type !== ModType.Anti) {
                return
            }

            antiModsPercentage += mod.defensePower?.percentage ?? 0
        })

        return (100 + antiModsPercentage) / 100
    }

    function destructivePylonMultiplier(): number {
        return 1
    }

    function ancientDestructionMultiplier(): number {
        let multiplier: number = 1;

        if (ancientResetPoints.ancient_destruction > 0) {
            multiplier += AncientDestruction.upgrades[ancientResetPoints.ancient_destruction - 1]
        }

        return multiplier
    }

    function ancientFortificationMultiplier(): number {
        let multiplier: number = 1;

        if (ancientResetPoints.ancient_fortification > 0) {
            multiplier += AncientFortification.upgrades[ancientResetPoints.ancient_fortification - 1]
        }

        return multiplier
    }

    // expose managed state as return value
    return { totalDps, defensePower, defenseHealth, criticalChance, criticalDamage, calculateDefensePower }
}
