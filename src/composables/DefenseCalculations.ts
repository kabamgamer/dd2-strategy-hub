import { ref } from 'vue'
import OutputModifier from "@/classes/OutputModifier";
import type {
    DefenseRootInterface,
    ModInterface,
    ShardInterface,
    UserDefenseInterface,
    CalculatedDefenseStatsInterface,
    DefenseSetupModifiersInterface,
    UserSetupDefenseInterface
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
    let setupDefenseOptions: { [defensesIncrementId: number]: UserSetupDefenseInterface }
    let defenseBoosts: {[incrementId: number]: CalculatedDefenseStatsInterface}
    let setupModifiers: DefenseSetupModifiersInterface

    const totalDps = ref<number>(0)
    const tooltipDps = ref<number>(0)
    const attackDamage = ref<number>(0)
    const attackRate = ref(0)
    const defenseHealth = ref(0)
    const defensePower = ref(0)
    const defenseRange = ref(0)
    const criticalChance = ref(0)
    const criticalDamage = ref(0)

    function calculateDefensePower(parsedDefense: DefenseRootInterface, parsedUserDefenseData: UserDefenseInterface, parsedDefenseMods: ModInterface[], parsedDefenseShards: ShardInterface[], parsedDefenseLevel: number, parsedAncientResetPoints: UserAncientResetPoints, parsedSetupDefenses?: UserDataStoreDefenseInterface[], parsedSetupDefenseOptions?: { [defensesIncrementId: number]: UserSetupDefenseInterface }, parsedDefenseBoosts?: {[incrementId: number]: CalculatedDefenseStatsInterface}, parsedSetupModifiers?: DefenseSetupModifiersInterface): void {
        defense = parsedDefense
        userDefenseData = parsedUserDefenseData
        defenseMods = parsedDefenseMods
        defenseShards = parsedDefenseShards
        defenseLevel = parsedDefenseLevel
        ancientResetPoints = parsedAncientResetPoints
        setupDefenses = parsedSetupDefenses ?? []
        setupDefenseOptions = parsedSetupDefenseOptions ?? {}
        defenseBoosts = parsedDefenseBoosts ?? {}
        setupModifiers = parsedSetupModifiers ?? getDefaultSetupModifiers()

        defensePower.value = calculatedDefensePower()
        defenseHealth.value = calculatedDefenseHealth()
        criticalChance.value = calculatedCriticalChance()
        criticalDamage.value = calculatedCriticalDamage()
        attackRate.value = calculatedAttackRate()
        totalDps.value = calculatedDps()

        defenseRange.value = calculatedDefenseRange()
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
            totalDefensePower = defensePowerModifiersAndDestructivePylon(totalDefensePower)
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

        if (isBuffDefense()) {
            const attackScalar: number = defense.attackScalar[defenseLevel-1]
            totalDefensePower *= attackScalar
        }

        return totalDefensePower
    }

    function calculatedDefenseRange(): number {
        let totalDefenseRange: number = (100 + ancientResetPoints.ancient_strikes) / 100 * defense.baseRange + ascensionDefenseRange();

        let rangeAdditive = 0;
        let rangeMultiplier = 1;
        [...defenseMods, ...defenseShards].forEach((util: ModInterface | ShardInterface) => {
            if ((util as ModInterface).id === 'diffusion') {
                return
            }

            if ((util as ModInterface).id === 'range_pylon') {
                return
            }

            if (util.defenseRange instanceof OutputModifier) {
                rangeAdditive += util.defenseRange.additive ?? 0
                if (util.defenseRange.percentage) {
                    rangeMultiplier *= (1 + util.defenseRange.percentage / 100)
                }
            }
        })

        totalDefenseRange = (totalDefenseRange + rangeAdditive) * rangeMultiplier * rangePylonAndDiffusionMultiplier()

        return Math.round((totalDefenseRange > defense.maxRange ? defense.maxRange : totalDefenseRange) * defense.rangeScalar)
    }

    function calculatedCriticalChance(): number {
        // 30% is the base crit chance
        let critChance: number = 30;

        [...defenseMods, ...defenseShards].forEach((util: ModInterface | ShardInterface) => {
            if ((util as ModInterface).type?.id === ModType.Diverse.id) {
                return
            }

            if ((util as ModInterface).type?.id === ModType.Unique.id) {
                if ((setupDefenseOptions[userDefenseData.incrementId]?.defenseCount ?? 1) > 1) {
                    return;
                }
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

            if ((util as ModInterface).type?.id === ModType.Unique.id) {
                if ((setupDefenseOptions[userDefenseData.incrementId]?.defenseCount ?? 1) > 1) {
                    return;
                }
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

        if (isBuffDefense()) {
            const attackScalar: number = defense.attackScalar[defenseLevel-1]
            criticalDamageMultiplier *= attackScalar
        }

        return criticalDamageMultiplier
    }

    function shouldApplyDefenseBoosts(): boolean {
        return Object.keys(defenseBoosts).length > 0 && defense.id !== 'BoostAura' && defense.id !== 'BuffBeam'
    }

    function defensePowerModifiersAndDestructivePylon(baseDefensePower: number, calculateTooltipDps: boolean = false): number {
        const hasDestructivePylon: boolean = defenseShards.filter((shard: ShardInterface) => shard.id === 'destructive_pylon').length > 0
        const hasMassDestruction: boolean = defenseShards.filter((shard: ShardInterface) => shard.id === 'mass_destruction').length > 0
        const boostedPowerShard: ShardInterface|undefined = defenseShards.filter((shard: ShardInterface) => shard.id === 'boosted_power')[0]
        const boostedBeamShard: ShardInterface|undefined = defenseShards.filter((shard: ShardInterface) => shard.id === 'boosted_beam')[0]

        // Calculate percentage modifiers
        defenseShards.forEach((shard: ShardInterface) => {
            if (shard.id === 'vampiric_empowerment') {
                return
            }

            if (shard.id === 'destruction' && hasDestructivePylon) {
                return
            }

            if (shard.id === 'boosted_power' && hasMassDestruction) {
                return
            }

            if (shard.id === 'boosted_beam' && hasMassDestruction) {
                return
            }

            if (shard.id === 'mass_destruction' && boostedPowerShard) {
                baseDefensePower *= (1 + ((shard.defensePower?.percentage ?? 0) + (boostedPowerShard.defensePower?.percentage ?? 0)) / 100)
                tooltipDps.value *= (1 + ((shard.defensePower?.percentage ?? 0) + (boostedPowerShard.defensePower?.percentage ?? 0)) / 100)
                return
            }

            if (shard.id === 'mass_destruction' && boostedBeamShard) {
                baseDefensePower *= (1 + ((shard.defensePower?.percentage ?? 0) + (boostedBeamShard.defensePower?.percentage ?? 0)) / 100)
                tooltipDps.value *= (1 + ((shard.defensePower?.percentage ?? 0) + (boostedBeamShard.defensePower?.percentage ?? 0)) / 100)
                return
            }

            if (shard.defensePower?.percentage) {
                baseDefensePower = shard.defensePower.calculate(baseDefensePower)

                if (calculateTooltipDps && shard.inTooltip) {
                    tooltipDps.value = shard.defensePower.calculate(tooltipDps.value)
                }
            }
        })

        // Calculate percentage modifiers
        defenseMods.forEach((mod: ModInterface) => {
            if (mod.type?.id === ModType.Diverse.id) {
                return
            }

            if (mod.type?.id === ModType.Power.id) {
                return
            }

            if (mod.type?.id === ModType.Anti.id) {
                return
            }

            if (mod.type?.id === ModType.Unique.id) {
                if ((setupDefenseOptions[userDefenseData.incrementId]?.defenseCount ?? 1) > 1) {
                    return;
                }
            }

            if (mod.id === 'unique_power_servo') {
                return
            }

            if (mod.id === 'motherly_instinct' && mod.defensePower instanceof OutputModifier) {
                baseDefensePower = motherlyInstinctModifier(baseDefensePower, mod.defensePower.percentage ?? 0, calculateTooltipDps)

                return;
            }

            if (mod.defensePower instanceof OutputModifier) {
                baseDefensePower = mod.defensePower.calculate(baseDefensePower)

                if (calculateTooltipDps && mod.inTooltip) {
                    tooltipDps.value = mod.defensePower.calculate(tooltipDps.value)
                }
            }
        })

        if (calculateTooltipDps) {
            tooltipDps.value = tooltipDps.value * destructivePylonMultiplier()
        }
        return baseDefensePower * destructivePylonMultiplier()
    }

    function motherlyInstinctModifier(baseDefensePower: number, percentage: number, calculateTooltipDps: boolean): number {
        let dragonsNestsCount: number = 0
        setupDefenses.forEach((setupDefense: UserDataStoreDefenseInterface) => {
            if (setupDefense.userData.id === defense.id) {
                return
            }

            if (setupDefense.userData.id === 'Dragon\'sNest') {
                dragonsNestsCount += setupDefenseOptions[setupDefense.incrementId].defenseCount
            }
        })

        // Add defense power per dragons nest
        for (let i = 0; i < dragonsNestsCount; i++) {
            baseDefensePower *= (1 + percentage / 100)

            if (calculateTooltipDps) {
                tooltipDps.value *= (1 + percentage / 100)
            }
        }

        return baseDefensePower
    }

    function isBuffDefense(): boolean {
        return defense?.id === 'BoostAura' || defense?.id === 'BuffBeam'
    }

    function calculatedDps(): number {
        tooltipDps.value = defensePower.value
        const baseDefensePower: number = defensePowerModifiersAndDestructivePylon(defensePower.value, true)

        const attackScalar: number = defense.attackScalar[defenseLevel-1]
        const critDamageMultiplier: number = (1 + criticalChance.value * criticalDamage.value)
        attackDamage.value = baseDefensePower * attackScalar * defenseSetupHeroBuffs()

        tooltipDps.value = tooltipDps.value * attackScalar * critDamageMultiplier / attackRate.value * defenseSetupHeroBuffs()

        return attackDamage.value * critDamageMultiplier / attackRate.value * antiModsMultiplier() * defenseSetupComboBuffs()
    }

    function calculatedAttackRate(): number {
        let attackRatePercentageBuffed: number = 0;

        [...defenseMods, ...defenseShards].forEach((util: ModInterface | ShardInterface) => {
            if ((util as ModInterface).type?.id === ModType.Unique.id) {
                if ((setupDefenseOptions[userDefenseData.incrementId]?.defenseCount ?? 1) > 1) {
                    return;
                }
            }
            
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

    function ascensionDefenseRange(): number {
        if (!defense as any instanceof HasAscensionPoints) {
            return 0;
        }

        return (defense as unknown as HasAscensionPoints).defenseRangeAP?.setUpgradeLevel(userDefenseData.ascensionPoints.defense_range ?? 0)?.defenseRange ?? 0
    }

    function vampiricEmpowerment(): number {
        const vampiricEmpowermentShard: ShardInterface|undefined = defenseShards.find((shard: ShardInterface) => shard.id === 'vampiric_empowerment')
        if (!vampiricEmpowermentShard) {
            return 0
        }

        const vampiricEmpowermentHealthPercentage: number = (vampiricEmpowermentShard.defensePower?.percentage ?? 0) / 100

        let vampiricEmpowermentBaseStat: number
        if (defense.id === 'BuffBeam') {
            vampiricEmpowermentBaseStat = userDefenseData.relic.defenseHealth
        } else {
            vampiricEmpowermentBaseStat = ancientFortificationMultiplier() * userDefenseData.pet.defenseHealth + defense.baseDefenseHealth + userDefenseData.relic.defenseHealth + ascensionDefenseHealth()
        }

        const baseVampiricDefensePower = vampiricEmpowermentBaseStat * vampiricEmpowermentHealthPercentage
        if (defenseLevel === 1) {
            return baseVampiricDefensePower
        }

        const currentHealthScalar: number = defense.hpScalar[defenseLevel-1]
        const tier1HealthScalar: number = defense.hpScalar[0]

        const vampiricUpgradeBonus: number = (vampiricEmpowermentBaseStat - ascensionDefenseHealth()) * (currentHealthScalar / tier1HealthScalar - 1) * vampiricEmpowermentHealthPercentage

        return baseVampiricDefensePower + vampiricUpgradeBonus
    }

    function powerMods(): number {
        let powerModsAdditive: number = 0;

        defenseMods.forEach((mod: ModInterface): void => {
            if (mod.type?.id !== ModType.Power.id && mod.id !== 'unique_power_servo') {
                return
            }

            if (mod.type?.id === ModType.Unique.id) {
                if ((setupDefenseOptions[userDefenseData.incrementId]?.defenseCount ?? 1) > 1) {
                    return;
                }
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

            if (setupDefense.userData.shards.filter((shardId: string) => shardId === 'destructive_pylon').length > 0) {
                // ToDo read values from database
                destructivePylonPercentage = 1.38
            }
        })

        return destructivePylonPercentage
    }

    function rangePylonAndDiffusionMultiplier(): number {
        let rangeMultiplier: number = 1;
        let rangePylonApplied: boolean = false;
        let diffusionApplied: boolean = false;
        setupDefenses.forEach((setupDefense: UserDataStoreDefenseInterface): void => {
            if (setupDefense.incrementId === userDefenseData.incrementId) {
                return
            }

            if (setupDefense.userData.shards.filter((shardId: string) => shardId === 'range_pylon').length > 0 && !rangePylonApplied) {
                // ToDo read values from database
                rangeMultiplier *= 1.24
                rangePylonApplied = true
            }

            if (setupDefense.userData.shards.filter((shardId: string) => shardId === 'diffusion').length > 0 && !diffusionApplied) {
                // ToDo read values from database
                rangeMultiplier *= 1.25
                diffusionApplied = true
            }
        })

        return rangeMultiplier
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
    return { totalDps, tooltipDps, attackDamage, attackRate, defensePower, defenseHealth, defenseRange, criticalChance, criticalDamage, calculateDefensePower, isBuffDefense }
}
