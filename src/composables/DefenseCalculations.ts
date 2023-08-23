import { ref } from 'vue'
import OutputModifier from "@/classes/OutputModifier";
import type {
    DefenseRootInterface,
    ModInterface,
    ShardInterface,
    UserDefenseInterface,
    CalculatedDefenseStatsInterface,
    DefenseSetupModifiersInterface
} from "@/interaces";
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
import { getDefaultSetupModifiers } from "@/stores/UserData";

export function useDefenseCalculations(): any {
    let defense: DefenseRootInterface
    let userDefenseData: UserDefenseInterface
    let defenseMods: ModInterface[]
    let defenseShards: ShardInterface[]
    let defenseLevel: number
    let ancientResetPoints: UserAncientResetPoints
    let setupDefenses: UserDataStoreDefenseInterface[]
    let defenseBoosts: {[incrementId: number]: CalculatedDefenseStatsInterface}
    let setupModifiers: DefenseSetupModifiersInterface

    const totalDps = ref<number>(0)
    const tooltipDps = ref<number>(0)
    const attackDamage = ref<number>(0)
    const defenseHealth = ref(0)
    const defensePower = ref(0)
    const criticalChance = ref(0)
    const criticalDamage = ref(0)

    function calculateDefensePower(parsedDefense: DefenseRootInterface, parsedUserDefenseData: UserDefenseInterface, parsedDefenseMods: ModInterface[], parsedDefenseShards: ShardInterface[], parsedDefenseLevel: number, parsedAncientResetPoints: UserAncientResetPoints, parsedSetupDefenses?: UserDataStoreDefenseInterface[], parsedDefenseBoosts?: {[incrementId: number]: CalculatedDefenseStatsInterface}, parsedSetupModifiers?: DefenseSetupModifiersInterface): void {
        defense = parsedDefense
        userDefenseData = parsedUserDefenseData
        defenseMods = parsedDefenseMods
        defenseShards = parsedDefenseShards
        defenseLevel = parsedDefenseLevel
        ancientResetPoints = parsedAncientResetPoints
        setupDefenses = parsedSetupDefenses ?? []
        defenseBoosts = parsedDefenseBoosts ?? {}
        setupModifiers = parsedSetupModifiers ?? getDefaultSetupModifiers()

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
        if (isBuffDefense()) {
            totalDefensePower = defensePowerShardsAndDestructivePylon(totalDefensePower)
        }

        // Add 14% defense power per radiant power shard
        if (setupModifiers.heroBuffs.radiantPower > 0) {
            for (let i = 0; i < (setupModifiers.heroBuffs.radiantPower > 4 ? 4 : setupModifiers.heroBuffs.radiantPower); i++) {
                totalDefensePower *= 1.14
            }
        }

        if (setupModifiers.heroBuffs.talisman && defense.id !== 'BoostAura' && defense.id !== 'BuffBeam') {
            // Add 60% defense power if talisman is active
            totalDefensePower *= 1.60

            if (setupModifiers.heroBuffs.talismanChiSupercharge) {
                // Add an additional 26% defense power if talisman is active and has a chi supercharge shard
                totalDefensePower *= 1.26
            }
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

        if (userDefenseData.relic.godlyStat?.type === 'critical_chance') {
            critChance += userDefenseData.relic.godlyStat.value
        }

        if (setupModifiers.heroBuffs.radiantCriticalPower > 0) {
            critChance += 3 * (setupModifiers.heroBuffs.radiantCriticalPower > 4 ? 4 : setupModifiers.heroBuffs.radiantCriticalPower)
        }

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

        if (userDefenseData.relic.godlyStat?.type === 'critical_damage') {
            criticalDamagePercentage += userDefenseData.relic.godlyStat.value
        }

        if (setupModifiers.heroBuffs.radiantCriticalPower > 0) {
            criticalDamagePercentage += 5 * (setupModifiers.heroBuffs.radiantCriticalPower > 4 ? 4 : setupModifiers.heroBuffs.radiantCriticalPower)
        }

        if (setupModifiers.heroBuffs.talisman && defense.id !== 'BoostAura' && defense.id !== 'BuffBeam') {
            criticalDamagePercentage += 20

            if (setupModifiers.heroBuffs.talismanChiBurst) {
                criticalDamagePercentage += 26
            }
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

    function defensePowerShardsAndDestructivePylon(baseDefensePower: number, calculateTooltipDps?: boolean): number {
        const hasDestructivePylon: boolean = defenseShards.filter((shard: ShardInterface) => shard.id === 'destructive_pylon').length > 0
        // Calculate percentage modifiers
        defenseShards.forEach((shard: ShardInterface) => {
            if (shard.id === 'destruction' && hasDestructivePylon) {
                return
            }

            if (shard.defensePower?.percentage) {
                baseDefensePower = shard.defensePower.calculate(baseDefensePower)

                if (calculateTooltipDps && shard.inTooltip) {
                    tooltipDps.value = shard.defensePower.calculate(tooltipDps.value)
                }
            }
        })

        if (calculateTooltipDps) {
            tooltipDps.value = tooltipDps.value * destructivePylonMultiplier()
        }
        return baseDefensePower * destructivePylonMultiplier()
    }

    function isBuffDefense(): boolean {
        return defense?.id === 'BoostAura' || defense?.id === 'BuffBeam'
    }

    function calculatedDps(): number {
        tooltipDps.value = defensePower.value
        const baseDefensePower: number = defensePowerShardsAndDestructivePylon(defensePower.value, true)

        const attackScalar: number = defense.attackScalar[defenseLevel-1]
        const critDamageMultiplier: number = (1 + criticalChance.value * criticalDamage.value)
        const calculatedAttackRate: number = attackRate()
        attackDamage.value = baseDefensePower * attackScalar * defenseSetupHeroBuffs()

        tooltipDps.value = tooltipDps.value * attackScalar * critDamageMultiplier / calculatedAttackRate * defenseSetupHeroBuffs()

        return attackDamage.value * critDamageMultiplier / calculatedAttackRate * antiModsMultiplier() * defenseSetupComboBuffs()
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

        let vampiricEmpowermentBaseStat: number
        if (defense.id === 'BuffBeam') {
            vampiricEmpowermentBaseStat = userDefenseData.relic.defenseHealth
        } else {
            vampiricEmpowermentBaseStat = ancientFortificationMultiplier() * userDefenseData.pet.defenseHealth + defense.baseDefenseHealth + userDefenseData.relic.defenseHealth + ascensionDefenseHealth()
        }

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

    function defenseSetupComboBuffs(): number {
        let comboModifier = 1

        if (setupModifiers.combos.ignite) {
            comboModifier *= 1.25
        }

        return comboModifier
    }

    function defenseSetupHeroBuffs(): number {
        let heroBuffModifier = 1

        if (setupModifiers.heroBuffs.callToArms && defense.id !== 'BoostAura' && defense.id !== 'BuffBeam') {
            let callToArmsMultiplier = 1.45;
            if (setupModifiers.heroBuffs.callToArmsInspiredShout) {
                callToArmsMultiplier = 1.70
            }

            heroBuffModifier *= callToArmsMultiplier
        }

        if (setupModifiers.heroBuffs.eruption && defense.id !== 'BoostAura' && defense.id !== 'BuffBeam') {
            let eruptionMultiplier = 1.3;
            if (setupModifiers.heroBuffs.eruptionTwiceAsBright) {
                eruptionMultiplier = 2.12
            }

            heroBuffModifier *= eruptionMultiplier
        }

        return heroBuffModifier
    }

    // expose managed state as return value
    return { totalDps, tooltipDps, attackDamage, defensePower, defenseHealth, criticalChance, criticalDamage, calculateDefensePower, isBuffDefense }
}
