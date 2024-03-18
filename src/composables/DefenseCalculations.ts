import { ref } from 'vue'

import NetherArcherBouncesStat from "@/defense_stats/NetherArcherBouncesStat";

import OutputModifier from "@/classes/OutputModifier";
import { AncientDefenseCriticalChance, AncientDefenseCriticalDamage, AncientDestruction, AncientFortification } from "@/data/AncientPowers";
import ModType from "@/enums/ModType";
import DamageType from "@/enums/DamageType";
import HasAscensionPoints from "@/traits/HasAscensionPoints";
import { getDefaultSetupModifiers } from "@/stores/UserData";

import useDefenseDamageType from "@/composables/DefenseDamageType";

import type { ModInterface, ShardInterface, CalculatedDefenseStatsInterface, DefenseSetupModifiersInterface, UserSetupDefenseInterface, DefenseStatInterface } from "@/types";
import type { UserAncientResetPoints } from "@/data/AncientPowers";
import type { UserDataStoreDefenseInterface } from "@/stores/UserData";

export function useDefenseCalculations(): any {
    let defense: UserDataStoreDefenseInterface
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
    const defenseHitPoints = ref(0)
    const defensePower = ref(0)
    const defenseRange = ref(0)
    const criticalChance = ref(0)
    const criticalDamage = ref(0)
    const defenseSpecificStats = ref<DefenseStatInterface[]>([])

    const { getDamageType } = useDefenseDamageType()

    function calculateDefensePower(
        parsedDefense: UserDataStoreDefenseInterface,
        parsedDefenseLevel: number,
        parsedAncientResetPoints: UserAncientResetPoints,
        parsedSetupDefenses?: UserDataStoreDefenseInterface[],
        parsedSetupDefenseOptions?: { [defensesIncrementId: number]: UserSetupDefenseInterface },
        parsedDefenseBoosts?: { [incrementId: number]: CalculatedDefenseStatsInterface },
        parsedSetupModifiers?: DefenseSetupModifiersInterface
    ): void {
        defense = parsedDefense
        defenseLevel = parsedDefenseLevel
        ancientResetPoints = parsedAncientResetPoints
        setupDefenses = parsedSetupDefenses ?? []
        setupDefenseOptions = parsedSetupDefenseOptions ?? {}
        defenseBoosts = parsedDefenseBoosts ?? {}
        setupModifiers = parsedSetupModifiers ?? getDefaultSetupModifiers()

        defensePower.value = calculatedDefensePower()
        defenseHealth.value = calculatedDefenseHealth()
        defenseHitPoints.value = defenseHealth.value * (defense.defenseData?.hpScalar[defenseLevel - 1] ?? 0)
        criticalChance.value = calculatedCriticalChance()
        criticalDamage.value = calculatedCriticalDamage()
        attackRate.value = calculatedAttackRate()
        totalDps.value = calculatedDps()

        defenseSpecificStats.value = getDefenseSpecificStats()

        defenseRange.value = calculatedDefenseRange()
    }

    function calculatedDefenseHealth(): number {
        if (!defense.defenseData?.baseDefenseHealth) {
            return 0
        }

        let totalDefenseHealth: number = defense.userData.pet.defenseHealth + defense.userData.relic.defenseHealth + defense.defenseData.baseDefenseHealth;

        totalDefenseHealth *= ancientFortificationMultiplier()
        totalDefenseHealth += ascensionDefenseHealth()

        let healthAdditive = 0;
        let healthMultiplier = 1;
        [...defense.userMods, ...defense.userShards].forEach((util: ModInterface | ShardInterface) => {
            if (util.defenseHealth?.mutators.pylon) {
                return;
            }

            if (util.defenseHealth instanceof OutputModifier) {
                healthAdditive += util.defenseHealth.additive ?? 0
                if (util.defenseHealth.percentage) {
                    healthMultiplier += util.defenseHealth.percentage / 100
                }
            }
        })

        totalDefenseHealth = (totalDefenseHealth + healthAdditive) * healthMultiplier

        return totalDefenseHealth * (1 + pylonsModifier('defenseHealth') / 100)
    }

    function calculatedDefensePower(): number {
        if (!defense.defenseData?.baseDefensePower) {
            return 0
        }

        let totalDefensePower: number = defense.defenseData.baseDefensePower + defense.userData.relic.defensePower + defense.userData.pet.defensePower;

        let rangeGambitSubtraction = 0
        if (defense.defenseData as any instanceof HasAscensionPoints) {
            rangeGambitSubtraction = (defense.defenseData as unknown as HasAscensionPoints).defenseRangeAP?.setUpgradeLevel(defense.userData.ascensionPoints.defense_range ?? 0)?.defensePower ?? 0;
        }

        totalDefensePower *= ancientDestructionMultiplier()
        totalDefensePower += ascensionDefensePower() + rangeGambitSubtraction + powerMods() + vampiricEmpowerment() + diverseMods('defensePower', 'additive')
        if (shouldApplyDefenseBoosts()) {
            totalDefensePower += getDefensePowerSetupBoosts()
        }

        // Add shard modifiers in defense power for Boost Aura and Buff Beam
        if (isBuffDefense() || defense.defenseData.id === 'FrostbiteTower') {
            totalDefensePower = defensePowerModifiersAndPylons(totalDefensePower)
        }

        // Add 14% defense power per radiant power shard
        if (setupModifiers.heroBuffs.radiantPower > 0) {
            for (let i = 0; i < (setupModifiers.heroBuffs.radiantPower > 4 ? 4 : setupModifiers.heroBuffs.radiantPower); i++) {
                totalDefensePower *= 1.14
            }
        }

        if (setupModifiers.heroBuffs.talisman && !isBuffDefense()) {
            // Add 60% defense power if talisman is active
            totalDefensePower *= 1.60

            if (setupModifiers.heroBuffs.talismanChiSupercharge) {
                // Add an additional 26% defense power if talisman is active and has a chi supercharge shard
                totalDefensePower *= 1.26
            }
        }

        if (isBuffDefense() && defenseLevel > 1) {
            const currentAttackScalar: number = defense.defenseData.attackScalar[defenseLevel-1]
            const firstAttackScalar: number = defense.defenseData.attackScalar[0]
            totalDefensePower += totalDefensePower * (currentAttackScalar / firstAttackScalar - 1)
        }

        return totalDefensePower
    }

    function calculatedDefenseRange(): number {
        if (!defense.defenseData?.baseRange) {
            return 0
        }

        let totalDefenseRange: number = (100 + ancientResetPoints.ancient_strikes) / 100 * defense.defenseData.baseRange + ascensionDefenseRange();

        let rangeAdditive = defense.userData.relic.godlyStat?.type === 'defense_range' ? defense.userData.relic.godlyStat.value : 0;
        let rangeMultiplier = 1;
        [...defense.userMods, ...defense.userShards].forEach((util: ModInterface | ShardInterface) => {
            if (util.defenseRange?.mutators.pylon) {
                return
            }

            if (util.defenseRange instanceof OutputModifier) {
                rangeAdditive += util.defenseRange.additive ?? 0
                if (util.defenseRange.percentage) {
                    rangeMultiplier *= (1 + util.defenseRange.percentage / 100)
                }
            }
        })

        totalDefenseRange = (totalDefenseRange + rangeAdditive) * rangeMultiplier * (1 + pylonsModifier('defenseRange') / 100)

        return Math.round((totalDefenseRange > defense.defenseData.maxRange ? defense.defenseData.maxRange : totalDefenseRange) * defense.defenseData.rangeScalar)
    }

    function calculatedCriticalChance(): number {
        // 30% is the base crit chance
        let critChance: number = 30;

        [...defense.userMods, ...defense.userShards].forEach((util: ModInterface | ShardInterface) => {
            if (util.criticalChance?.mutators.pylon) {
                return;
            }

            if ((util as ModInterface).type?.equals(ModType.Diverse)) {
                return
            }

            if ((util as ModInterface).type?.equals(ModType.Unique)) {
                if ((setupDefenseOptions[defense.userData.incrementId]?.defenseCount ?? 1) > 1) {
                    return;
                }
            }

            if (util.criticalChance instanceof OutputModifier) {
                critChance += util.criticalChance.percentage ?? 0
            }
        })

        critChance += diverseMods('criticalChance', 'percentage');

        if (defense.userData.relic.godlyStat?.type === 'critical_chance') {
            critChance += defense.userData.relic.godlyStat.value
        }

        if (setupModifiers.heroBuffs.radiantCriticalPower > 0) {
            critChance += 3 * (setupModifiers.heroBuffs.radiantCriticalPower > 4 ? 4 : setupModifiers.heroBuffs.radiantCriticalPower)
        }

        critChance += pylonsModifier('criticalChance')

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

        [...defense.userMods, ...defense.userShards].forEach((util: ModInterface | ShardInterface) => {
            if (util.criticalDamage?.mutators.pylon) {
                return;
            }

            if ((util as ModInterface).type?.equals(ModType.Diverse)) {
                return
            }

            if ((util as ModInterface).type?.equals(ModType.Unique)) {
                if ((setupDefenseOptions[defense.userData.incrementId]?.defenseCount ?? 1) > 1) {
                    return;
                }
            }

            if (util.criticalDamage instanceof OutputModifier) {
                criticalDamagePercentage += util.criticalDamage.percentage ?? 0
            }
        })

        criticalDamagePercentage += diverseMods('criticalDamage', 'percentage');
        if (shouldApplyDefenseBoosts()) {
            criticalDamagePercentage += getDefenseCriticalDamageSetupBoosts()
        }

        if (defense.userData.relic.godlyStat?.type === 'critical_damage') {
            criticalDamagePercentage += defense.userData.relic.godlyStat.value
        }

        if (setupModifiers.heroBuffs.radiantCriticalPower > 0) {
            criticalDamagePercentage += 5 * (setupModifiers.heroBuffs.radiantCriticalPower > 4 ? 4 : setupModifiers.heroBuffs.radiantCriticalPower)
        }

        if (setupModifiers.heroBuffs.talisman && !isBuffDefense()) {
            criticalDamagePercentage += 20

            if (setupModifiers.heroBuffs.talismanChiBurst) {
                criticalDamagePercentage += 26
            }
        }

        criticalDamagePercentage += pylonsModifier('criticalDamage')

        let criticalDamageMultiplier: number = criticalDamagePercentage / 100

        // apply ancient reset points
        if (ancientResetPoints.ancient_defense_critical_damage > 0) {
            criticalDamageMultiplier += AncientDefenseCriticalDamage.upgrades[ancientResetPoints.ancient_defense_critical_damage - 1]
        }

        if (isBuffDefense() && defenseLevel > 1 && defense.defenseData) {
            const currentAttackScalar: number = defense.defenseData.attackScalar[defenseLevel-1]
            const firstAttackScalar: number = defense.defenseData.attackScalar[0]
            criticalDamageMultiplier += criticalDamageMultiplier * (currentAttackScalar / firstAttackScalar - 1)
        }

        return criticalDamageMultiplier
    }

    function calculatedAttackRate(): number {
        if (!defense.defenseData?.baseAttackRate) {
            return 0
        }

        let attackRatePercentageBuffed: number = 0;

        [...defense.userMods, ...defense.userShards].forEach((util: ModInterface | ShardInterface) => {
            if (util.defensePower?.mutators.pylon) {
                return;
            }

            if ((util as ModInterface).type?.equals(ModType.Unique)) {
                if ((setupDefenseOptions[defense.userData.incrementId]?.defenseCount ?? 1) > 1) {
                    return;
                }
            }

            if (util.defenseRate instanceof OutputModifier) {
                attackRatePercentageBuffed += util.defenseRate.percentage ?? 0
            }
        })
        attackRatePercentageBuffed += ascensionDefenseRatePercentage();

        attackRatePercentageBuffed += pylonsModifier('defenseRate');

        const attackRateMultiplier: number = 1 - attackRatePercentageBuffed / 100

        const calculatedAttackRate: number = defense.defenseData.baseAttackRate * attackRateMultiplier;

        return calculatedAttackRate < defense.defenseData.maxAttackRate ? defense.defenseData.maxAttackRate : calculatedAttackRate
    }

    function calculatedDps(): number {
        if (!defense.defenseData) {
            return 0
        }

        tooltipDps.value = defensePower.value
        const baseDefensePower: number = defensePowerModifiersAndPylons(defensePower.value, true)

        const attackScalar: number = defense.defenseData.attackScalar[defenseLevel-1]
        const critDamageMultiplier: number = (1 + criticalChance.value * criticalDamage.value)
        attackDamage.value = baseDefensePower * attackScalar * defenseSetupHeroBuffs()

        tooltipDps.value = tooltipDps.value * attackScalar * critDamageMultiplier / attackRate.value * defenseSetupHeroBuffs()

        return attackDamage.value * critDamageMultiplier / attackRate.value * antiModsMultiplier() * defenseSetupComboBuffs() * defenseSetupModifiers() + explosiveGuard()
    }

    function motherlyInstinctModifier(baseDefensePower: number, percentage: number, calculateTooltipDps: boolean): number {
        let dragonsNestsCount: number = 0
        setupDefenses.forEach((setupDefense: UserDataStoreDefenseInterface) => {
            if (setupDefense.userData.id === 'Dragon\'sNest') {
                dragonsNestsCount += setupDefenseOptions[setupDefense.incrementId].defenseCount
            }
        })

        let baseDefensePowerBonus: number = 1
        // Add defense power per dragons nest
        for (let i = 0; i < dragonsNestsCount; i++) {
            baseDefensePowerBonus += (percentage / 100)
        }

        baseDefensePower *= baseDefensePowerBonus
        if (calculateTooltipDps) {
            tooltipDps.value *= baseDefensePowerBonus
        }

        return baseDefensePower
    }

    function defensePowerModifiersAndPylons(baseDefensePower: number, calculateTooltipDps: boolean = false): number {
        const hasDestruction: boolean = getDefenseShardById('destruction') !== undefined
        const hasMassDestruction: boolean = getDefenseShardById('mass_destruction') !== undefined
        const boostedPowerShard: ShardInterface|undefined = getDefenseShardById('boosted_power')
        const boostedBeamShard: ShardInterface|undefined = getDefenseShardById('boosted_beam')

        // Calculate percentage modifiers
        defense.userShards.forEach((shard: ShardInterface) => {
            if (shard.id === 'destructive_pylon' && !hasDestruction) {
                baseDefensePower *= 1.34;

                if (calculateTooltipDps && shard.inTooltip) {
                    tooltipDps.value *= 1.34;
                }
            }

            if (shard.defensePower?.mutators.pylon) {
                return
            }

            if (shard.id === 'vampiric_empowerment' || shard.id === 'explosive_shielding_guard' || shard.id === 'explosive_guard') {
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

        // Calculate additive modifiers
        defense.userMods.forEach((mod: ModInterface) => {
            if (mod.type?.equals(ModType.Diverse)) {
                return
            }

            if (mod.type?.equals(ModType.Power)) {
                return
            }

            if (mod.type?.equals(ModType.Anti)) {
                return
            }

            if (mod.type?.equals(ModType.Unique)) {
                if ((setupDefenseOptions[defense.userData.incrementId]?.defenseCount ?? 1) > 1) {
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
            tooltipDps.value = tooltipDps.value * (1 + pylonsModifier('defensePower') / 100)
        }
        return baseDefensePower * (1 + pylonsModifier('defensePower') / 100)
    }

    function getDefensePowerSetupBoosts(): number {
        let boostedPower: number = 0;

        for (const defenseBoostIncrementId in defenseBoosts) {
            if (parseInt(defenseBoostIncrementId) === defense.userData.incrementId) {
                continue
            }

            boostedPower += defenseBoosts[defenseBoostIncrementId].defensePower
        }

        return boostedPower
    }

    function getDefenseCriticalDamageSetupBoosts(): number {
        return Object.values(defenseBoosts).reduce((total: number, defenseBoost: CalculatedDefenseStatsInterface) => total + defenseBoost.critDamage*100, 0)
    }

    function shouldApplyDefenseBoosts(): boolean {
        return Object.keys(defenseBoosts).length > 0 && !isBuffDefense()
    }

    function isBuffDefense(): boolean {
        return defense?.defenseData?.id === 'BoostAura' || defense?.defenseData?.id === 'BuffBeam'
    }

    function ascensionDefenseRatePercentage(): number {
        if (!defense.defenseData as any instanceof HasAscensionPoints) {
            return 0;
        }

        return (defense.defenseData as unknown as HasAscensionPoints).defenseRateAP?.setUpgradeLevel(defense.userData.ascensionPoints.defense_rate ?? 0)?.defenseRate ?? 0
    }

    function ascensionDefensePower(): number {
        if (!defense.defenseData as any instanceof HasAscensionPoints) {
            return 0;
        }

        return (defense.defenseData as unknown as HasAscensionPoints).defensePowerAP?.setUpgradeLevel(defense.userData.ascensionPoints.defense_power ?? 0)?.defensePower ?? 0
    }

    function ascensionDefenseHealth(): number {
        if (!defense.defenseData as any instanceof HasAscensionPoints) {
            return 0;
        }

        return (defense.defenseData as unknown as HasAscensionPoints).defenseHealthAP?.setUpgradeLevel(defense.userData.ascensionPoints.defense_health ?? 0)?.defenseHealth ?? 0
    }

    function ascensionDefenseRange(): number {
        if (!defense.defenseData as any instanceof HasAscensionPoints) {
            return 0;
        }

        return (defense.defenseData as unknown as HasAscensionPoints).defenseRangeAP?.setUpgradeLevel(defense.userData.ascensionPoints.defense_range ?? 0)?.defenseRange ?? 0
    }

    function explosiveGuard(): number {
        const explosiveShard: ShardInterface|undefined = getDefenseShardById('explosive_guard') || getDefenseShardById('explosive_shielding_guard')

        if (!explosiveShard) {
            return 0
        }

        const explosiveShardMultiplier = (explosiveShard.defensePower?.percentage ?? 100) / 100
        const explosiveShardProcChanceMultiplier = .35

        return defenseHealth.value * explosiveShardMultiplier * explosiveShardProcChanceMultiplier
    }

    function vampiricEmpowerment(): number {
        if (!defense.defenseData) {
            return 0
        }

        const vampiricEmpowermentShard: ShardInterface|undefined = getDefenseShardById('vampiric_empowerment')
        if (!vampiricEmpowermentShard) {
            return 0
        }

        const vampiricEmpowermentHealthPercentage: number = (vampiricEmpowermentShard.defensePower?.percentage ?? 0) / 100

        let vampiricEmpowermentBaseStat: number
        if (defense.defenseData.id === 'BuffBeam') {
            vampiricEmpowermentBaseStat = defense.userData.relic.defenseHealth
        } else {
            vampiricEmpowermentBaseStat = (defense.userData.pet.defenseHealth + defense.defenseData.baseDefenseHealth + defense.userData.relic.defenseHealth) * ancientFortificationMultiplier() + ascensionDefenseHealth()
        }

        const baseVampiricDefensePower = vampiricEmpowermentBaseStat * vampiricEmpowermentHealthPercentage
        if (defenseLevel === 1) {
            return baseVampiricDefensePower
        }

        vampiricEmpowermentBaseStat += ascensionDefenseHealth()

        const currentHealthScalar: number = defense.defenseData.hpScalar[defenseLevel-1]
        const tier1HealthScalar: number = defense.defenseData.hpScalar[0]

        const vampiricUpgradeBonus: number = vampiricEmpowermentBaseStat * (currentHealthScalar / tier1HealthScalar - 1) * vampiricEmpowermentHealthPercentage

        return baseVampiricDefensePower + vampiricUpgradeBonus
    }

    function powerMods(): number {
        let powerModsAdditive: number = 0;

        defense.userMods.forEach((mod: ModInterface): void => {
            if (!mod.type?.equals(ModType.Power) && mod.id !== 'unique_power_servo') {
                return
            }

            if (mod.type?.equals(ModType.Unique)) {
                if ((setupDefenseOptions[defense.userData.incrementId]?.defenseCount ?? 1) > 1) {
                    return;
                }
            }

            powerModsAdditive += mod.defensePower?.additive ?? 0
        })

        return powerModsAdditive
    }

    function diverseMods(stat: string, modifierType: string): number {
        const defenseIds: string[] = setupDefenses.map((setupDefense: UserDataStoreDefenseInterface) => setupDefense.userData.id)
        const uniqueDefenseCount: number = defenseIds.filter((defenseId: string, index: number) => defenseIds.indexOf(defenseId) === index).length
        const diverseStack: number = uniqueDefenseCount > 0 ? uniqueDefenseCount - 1 : (defense.userData.diverseStack ?? 0)

        let calculatedDiversePower = 0
        defense.userMods.forEach((mod: ModInterface): void => {
            if (!mod.type?.equals(ModType.Diverse)) {
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

        defense.userMods.forEach((mod: ModInterface): void => {
            if (!mod.type?.equals(ModType.Anti)) {
                return
            }

            antiModsPercentage += mod.defensePower?.percentage ?? 0
        })

        return (100 + antiModsPercentage) / 100
    }

    function pylonsModifier(stat: string): number {
        let pylons = getPylonShardsForStat(stat)

        pylons = filterUnstackablePylons(stat, pylons)

        let defensePowerPylonsPercentage: number = 0;
        defensePowerPylonsPercentage += Object.values(pylons).reduce((accumulator: number, currentValue: any) => accumulator + currentValue.shard[stat].percentage, 0)

        return defensePowerPylonsPercentage
    }

    function getPylonShardsForStat(stat: string, fromSelf: boolean = false): { [shardId: string]: { defenseIncrementId: number, shard: ShardInterface } } {
        const pylons: { [shardId: string]: { defenseIncrementId: number, shard: ShardInterface } } = {};

        for (const setupDefense of setupDefenses) {
            if (setupDefense.incrementId === defense.userData.incrementId) {
                continue;
            }

            for (const shard of setupDefense.userShards) {
                // @ts-ignore
                const shardStat: OutputModifier|undefined = shard[stat] as OutputModifier|undefined
                const defenseType: string = defense.defenseData?.type ?? ''

                if (!shardStat?.mutators.pylon) {
                    continue;
                }

                if (fromSelf ? !shardStat?.mutators.pylon.fromSelf : shardStat?.mutators.pylon.fromSelf) {
                    continue;
                }

                if ((shardStat?.mutators.pylon.types?.length || 0) > 0 && !(shardStat?.mutators.pylon.types || []).includes(defenseType)) {
                    continue;
                }

                pylons[shard.id] = {defenseIncrementId: setupDefense.incrementId, shard}
            }
        }

        return pylons;
    }

    function filterUnstackablePylons(stat: string, pylons: { [shardId: string]: { defenseIncrementId: number, shard: ShardInterface } }): { [shardId: string]: { defenseIncrementId: number, shard: ShardInterface } } {
        for (const shardId in pylons) {
            const pylonShard: ShardInterface|any = pylons[shardId].shard;
            for (const noStack of pylonShard[stat]?.mutators.pylon.noStack ?? []) {
                if (pylons[noStack]) {
                    delete pylons[shardId]
                    break
                }
            }
        }

        return pylons;
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

        if (setupModifiers.combos.shatter && getDamageType(defense).equals(DamageType.Earth)) {
            comboModifier *= 1.5
        }

        return comboModifier
    }

    function defenseSetupModifiers(): number {
        if (!defense.defenseData) {
            return 1
        }

        let setupModifier = 1

        // Armored enemies take 25% extra magical damage and 50% less damage from physical attacks
        if (setupModifiers.laneMutators.armored) {
            if (!defense.defenseData.damageType.equals(DamageType.Physical)) {
                setupModifier *= 1.25
            } else {
                setupModifier *= .50
            }
        }

        // Reckless/Berserked enemies take 50% extra damage
        if (setupModifiers.laneMutators.berserked) {
            setupModifier *= 1.50
        }
        if (setupModifiers.laneMutators.reckless) {
            setupModifier *= 1.50
        }

        // Spellbreaker enemies take 25% extra physical 50% less magical damage
        if (setupModifiers.laneMutators.spellbreaker) {
            if (defense.defenseData.damageType.equals(DamageType.Physical)) {
                setupModifier *= 1.25
            } else {
                setupModifier *= .50
            }
        }

        // Enemies with a soft spot have 20% extra resistance
        if (setupModifiers.laneMutators.softSpot) {
            setupModifier *= .80
        }

        // If enemies are frost enemies, they take +100% extra fire damage and -50% water damage
        if (setupModifiers.enemyType?.frost) {
            if (getDamageType(defense).equals(DamageType.Fire)) {
                setupModifier *= 2
            }

            if (getDamageType(defense).equals(DamageType.Water)) {
                setupModifier *= .50
            }
        }

        return setupModifier
    }

    function defenseSetupHeroBuffs(): number {
        let heroBuffModifier = 1

        if (setupModifiers.heroBuffs.callToArms && !isBuffDefense()) {
            let callToArmsMultiplier = 1.45;
            if (setupModifiers.heroBuffs.callToArmsInspiredShout) {
                callToArmsMultiplier = 1.70
            }

            heroBuffModifier *= callToArmsMultiplier
        }

        if (setupModifiers.heroBuffs.eruption && !isBuffDefense()) {
            let eruptionMultiplier = 1.3;
            if (setupModifiers.heroBuffs.eruptionTwiceAsBright) {
                eruptionMultiplier = 2.12
            }

            heroBuffModifier *= eruptionMultiplier
        }

        return heroBuffModifier
    }

    function getDefenseShardById(shardId: string): ShardInterface|undefined {
        return defense.userShards.find((shard: ShardInterface) => shard.id === shardId)
    }

    function getDefenseSpecificStats(): DefenseStatInterface[] {
        switch (defense.defenseData?.id) {
            case 'NetherArcher':
                return [
                    new NetherArcherBouncesStat(totalDps.value, defense.userMods, defense.userShards)
                ]
            default:
                return []
        }
    }

    // expose managed state as return value
    return { totalDps, tooltipDps, attackDamage, attackRate, defensePower, defenseHealth, defenseHitPoints, defenseRange, criticalChance, criticalDamage, defenseSpecificStats, calculateDefensePower, isBuffDefense }
}
