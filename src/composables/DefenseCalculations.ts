import { ref } from 'vue'
import OutputModifier from "@/classes/OutputModifier";
import type { DefenseRootInterface, ModInterface, ShardInterface, UserDefenseInterface, CalculatedDefenseStatsInterface } from "@/interaces";
import type { UserAncientResetPoints } from "@/data/AncientPowers";
import {
    AncientDefenseCriticalChance,
    AncientDefenseCriticalDamage,
    AncientDestruction,
    AncientFortification
} from "@/data/AncientPowers";

import HasAscensionPoints from "@/traits/HasAscensionPoints";

import ModType from "@/enums/ModType";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";

export function useDefenseCalculations(): any {
    let defense: DefenseRootInterface
    let userDefenseData: UserDefenseInterface
    let defenseMods: ModInterface[]
    let defenseShards: ShardInterface[]
    let defenseLevel: number
    let ancientResetPoints: UserAncientResetPoints
    let setupDefenses: UserDataStoreDefenseInterface[]
    let defenseBoosts: {[incrementId: number]: CalculatedDefenseStatsInterface}

    const totalDps = ref<number>()
    const defenseHealth = ref(0)
    const defensePower = ref(0)
    const criticalChance = ref(0)
    const criticalDamage = ref(0)

    function calculateDefensePower(parsedDefense: DefenseRootInterface, parsedUserDefenseData: UserDefenseInterface, parsedDefenseMods: ModInterface[], parsedDefenseShards: ShardInterface[], parsedDefenseLevel: number, parsedAncientResetPoints: UserAncientResetPoints, parsedSetupDefenses?: UserDataStoreDefenseInterface[], parsedDefenseBoosts?: {[incrementId: number]: CalculatedDefenseStatsInterface}): void {
        defense = parsedDefense
        userDefenseData = parsedUserDefenseData
        defenseMods = parsedDefenseMods
        defenseShards = parsedDefenseShards
        defenseLevel = parsedDefenseLevel
        ancientResetPoints = parsedAncientResetPoints
        setupDefenses = parsedSetupDefenses ?? []
        defenseBoosts = parsedDefenseBoosts ?? {}

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

        let totalDefensePower: number = defense.baseDefensePower + userDefenseData.relic.defensePower + userDefenseData.pet.defensePower;

        let rangeGambitSubtraction = 0
        if (defense as any instanceof HasAscensionPoints) {
            rangeGambitSubtraction = (defense as unknown as HasAscensionPoints).defenseRangeAP?.setUpgradeLevel(userDefenseData.ascensionPoints.defense_range ?? 0)?.defensePower ?? 0;
        }

        totalDefensePower = totalDefensePower * ancientDestructionMultiplier() + ascensionDefensePower() + rangeGambitSubtraction + powerMods() + vampiricEmpowerment() + diverseMods('defensePower', 'additive')
        if (shouldApplyDefenseBoosts()) {
            Object.values(defenseBoosts).forEach((defenseBoost: CalculatedDefenseStatsInterface) => {
                totalDefensePower += defenseBoost.defensePower/10
            })
        }

        // Add shard modifiers in defense power for Boost Aura and Buff Beam
        if (defense.id === 'BoostAura' || defense.id === 'BuffBeam') {
            totalDefensePower = defensePowerShardsAndDestructivePylon(totalDefensePower)
        }

        return totalDefensePower
    }

    function calculatedCriticalChance(): number {
        // 30% is the base crit chance
        let critChance: number = 30;

        [...defenseMods, ...defenseShards].forEach((util: ModInterface | ShardInterface) => {
            if ((util as ModInterface).type?.id === ModType.Diverse.id) {
                return
            }

            if (util.criticalChance instanceof OutputModifier) {
                critChance += util.criticalChance.percentage ?? 0
            }
        })

        critChance += diverseMods('criticalChance', 'percentage');

        let critChanceMultiplier: number = critChance / 100

        // apply ancient reset points
        if (ancientResetPoints.ancient_defense_critical_chance > 0) {
            critChanceMultiplier += AncientDefenseCriticalChance.upgrades[ancientResetPoints.ancient_defense_critical_chance - 1]
        }

        return critChanceMultiplier > 1 ? 1 : critChanceMultiplier
    }

    function calculatedCriticalDamage(): number {
        // 50% is the base crit damage
        let criticalDamagePercentage: number = 50;

        [...defenseMods, ...defenseShards].forEach((util: ModInterface | ShardInterface) => {
            if ((util as ModInterface).type?.id === ModType.Diverse.id) {
                return
            }

            if (util.criticalDamage instanceof OutputModifier) {
                criticalDamagePercentage += util.criticalDamage.percentage ?? 0
            }
        })

        criticalDamagePercentage += diverseMods('criticalDamage', 'percentage');
        if (shouldApplyDefenseBoosts()) {
            Object.values(defenseBoosts).forEach((defenseBoost: CalculatedDefenseStatsInterface) => {
                criticalDamagePercentage += defenseBoost.critDamage*100/4
            })
        }

        let criticalDamageMultiplier: number = criticalDamagePercentage / 100

        // apply ancient reset points
        if (ancientResetPoints.ancient_defense_critical_damage > 0) {
            criticalDamageMultiplier += AncientDefenseCriticalDamage.upgrades[ancientResetPoints.ancient_defense_critical_damage - 1]
        }

        return criticalDamageMultiplier
    }

    function shouldApplyDefenseBoosts(): boolean {
        return Object.keys(defenseBoosts).length > 0 && defense.id !== 'BoostAura' && defense.id !== 'BuffBeam'
    }

    function defensePowerShardsAndDestructivePylon(baseDefensePower: number): number {
        const destructivePylon: number = destructivePylonMultiplier()
        // Calculate percentage modifiers
        defenseShards.forEach((shard: ShardInterface) => {
            if (shard.id === 'destructive_pylon') {
                return
            }

            if (shard.id === 'destruction' && destructivePylon > 1) {
                return
            }

            if (shard.defensePower?.percentage) {
                baseDefensePower = shard.defensePower.calculate(baseDefensePower)
            }
        })

        return baseDefensePower * destructivePylon
    }

    function calculatedDps(): number {
        const baseDefensePower: number = defensePowerShardsAndDestructivePylon(defensePower.value)

        const attackDamage: number = baseDefensePower * defense.attackScalar[defenseLevel-1]
        const baseDps: number = attackDamage * (1 + criticalChance.value * criticalDamage.value) / attackRate()
        return baseDps * antiModsMultiplier()
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

    function powerMods(): number {
        let powerModsAdditive: number = 0;

        defenseMods.forEach((mod: ModInterface): void => {
            if (mod.type?.id !== ModType.Power.id) {
                return
            }

            powerModsAdditive += mod.defensePower?.additive ?? 0
        })

        return powerModsAdditive
    }

    function diverseMods(stat: string, modifierType: string): number {
        let calculatedDiversePower = 0
        const diverseStack = setupDefenses.length > 0 ? setupDefenses.length - 1 : (userDefenseData.diverseStack ?? 0)

        defenseMods.forEach((mod: ModInterface): void => {
            if (mod.type?.id !== ModType.Diverse.id) {
                return
            }

            const statModifier = (mod as any)[stat]
            if (!statModifier) {
                return;
            }

            calculatedDiversePower += (statModifier[modifierType] ?? 0) * diverseStack
        })

        return calculatedDiversePower
    }

    function antiModsMultiplier(): number {
        let antiModsPercentage: number = 0;

        defenseMods.forEach((mod: ModInterface): void => {
            if (mod.type?.id !== ModType.Anti.id) {
                return
            }

            antiModsPercentage += mod.defensePower?.percentage ?? 0
        })

        return (100 + antiModsPercentage) / 100
    }

    function destructivePylonMultiplier(): number {
        let destructivePylonPercentage: number = 1;
        setupDefenses.forEach((setupDefense: UserDataStoreDefenseInterface): void => {
            if (setupDefense.incrementId === userDefenseData.incrementId) {
                return
            }

            if (setupDefense.userData.shards.filter((modId: string) => modId === 'destructive_pylon').length > 0) {
                destructivePylonPercentage = 1.38
            }
        })

        return destructivePylonPercentage
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
