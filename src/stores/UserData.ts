import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type {
    DefenseRootInterface,
    UserDefenseInterface,
    UserDefenseSetupInterface,
    DefenseSetupModifiersInterface,
    ShardInterface, ModInterface
} from "@/types";
import type { UserAncientResetPoints } from "@/data/AncientPowers";
import type { TableHeaderInterface } from '@/components/utilities/Defense/Overview/Table/DefenseOverviewTable.vue';
import DataMigrations from "@/data/DataMigrations";
import { useDefenseStore } from "@/stores/DefenseInfo";
import { useModStore } from "@/stores/ModInfo";
import { useShardStore } from "@/stores/ShardInfo";
import UserDefense from '@/classes/UserDefense';

export interface UserDataStoreDefenseInterface {
    incrementId: number
    userData: UserDefenseInterface,
    defenseData?: DefenseRootInterface,
    userMods: ModInterface[],
    userShards: ShardInterface[],
    isBuffDefense: boolean,
    ascensionDefenseHealth: number,
    ascensionDefensePower: number,
    ascensionRange: number,
    ascensionRate: number,
}

export const useUserDataStore = defineStore('userDataStore', () => {
    const { getDefenseRoot } = useDefenseStore();
    const { getModById } = useModStore();
    const { getShardById } = useShardStore();

    const dataMigration = new DataMigrations

    const tableView = ref<boolean>(localStorage.getItem('tableView') === 'true')
    const lastVisitedVersion = ref<string>(localStorage.getItem('lastVisitedVersion') ?? 'v0.0.0')
    const isDev = ref<boolean>(localStorage.getItem('isDev') === 'true')
    const tableHeaders = ref<TableHeaderInterface[]>(getTableHeaders())
    const defenses = ref<UserDataStoreDefenseInterface[]>(getDefenses())
    const defenseSetups = ref<UserDefenseSetupInterface[]>(getDefenseSetups())
    const ancientPowerPoints = ref<UserAncientResetPoints>(getAncientPowerPoints())

    loadDefenseData()
    loadModData()
    loadShardData()

    function getDefenses(): UserDataStoreDefenseInterface[] {
        const defenses: UserDefenseInterface[] = JSON.parse(localStorage.getItem('defenses') ?? '[]')

        const allDefenses: UserDataStoreDefenseInterface[] = []
        for (const userDefense of defenses) {
            allDefenses.push(new UserDefense({
                incrementId: userDefense.incrementId,
                userData: userDefense,
                userShards: [],
                userMods: [],
            }))
        }

        return allDefenses
    }

    function getTableHeaders(): TableHeaderInterface[] {
        const tableHeaders: TableHeaderInterface[] = JSON.parse(localStorage.getItem('tableHeaders') ?? '[]')

        if (tableHeaders.length > 0) return tableHeaders

        const defaultTableHeaders: TableHeaderInterface[] = [
            { key: "defenseHitPoints", label: "Hit Points", visible: true },
            { key: "attackRate", label: "Rate", visible: true },
            { key: "defenseRange", label: "Range", visible: true },
            { key: "criticalChance", label: "Crit. Chance", visible: true },
            { key: "criticalDamage", label: "Crit. Damage", visible: true },
            { key: "tooltipDps", label: "Tooltip DPS", visible: true },
            { key: "totalDps", label: "Actual DPS", visible: true },
        ];
        return defaultTableHeaders
    }

    function getDefenseSetups(): UserDefenseSetupInterface[] {
        return dataMigration.migrateDefenseSetups(JSON.parse(localStorage.getItem('defenseSetups') ?? '[]')) as UserDefenseSetupInterface[]
    }

    function getAncientPowerPoints(): UserAncientResetPoints {
        if (!localStorage.getItem('ancientResetPoints')) {
            return {
                ancient_ability_power: 0,
                ancient_heroic_power: 0,
                ancient_health: 0,
                ancient_resistance: 0,
                ancient_life_steal: 0,
                ancient_fortification: 0,
                ancient_destruction: 0,
                ancient_strikes: 0,
                ancient_builder: 0,
                ancient_respawn: 0,
                ancient_defense_critical_damage: 0,
                ancient_defense_critical_chance: 0,
                ancient_hero_critical_damage: 0,
                ancient_hero_critical_chance: 0,
            }
        }

        return JSON.parse(localStorage.getItem('ancientResetPoints') ?? '{}')
    }

    async function loadDefenseData(): Promise<void> {
        for (const index in defenses.value) {
            const item = defenses.value[index]

            if (defenses.value[index].defenseData) continue

            defenses.value[index].defenseData = await getDefenseRoot(item.userData.id)
        }
    }

    async function loadModData(): Promise<void> {
        for (const index in defenses.value) {
            const item = defenses.value[index]

            if (item.userData.relic.mods.length < 1) continue

            defenses.value[index].userMods = await Promise.all(item.userData.relic.mods.map(async (modId: string): Promise<ModInterface> => await getModById(modId)))
        }
    }

    async function loadShardData(): Promise<void> {
        for (const index in defenses.value) {
            const item = defenses.value[index]

            if (item.userData.shards.length < 1) continue

            defenses.value[index].userShards = await Promise.all(item.userData.shards.map(async (shardId: string): Promise<ShardInterface> => await getShardById(shardId)))
        }
    }

    function getNextDefenseIncrementId(): number {
        // highest incrementId + 1
        return Math.max(...defenses.value.map((defense) => defense.incrementId), 0) + 1;
    }

    function getNextDefenseSetupIncrementId(): number {
        // highest incrementId + 1
        return Math.max(...defenseSetups.value.map((setup) => setup.incrementId), 0) + 1;
    }

    function deleteDefense(defenseIncrementId: number): void {
        // Delete defense from defense setups
        for (const setup of defenseSetups.value) {
            delete setup.defenses[defenseIncrementId]
        }

        for (const index in defenses.value) {
            const item = defenses.value[index]

            if (item.incrementId !== defenseIncrementId) continue

            defenses.value.splice(parseInt(index), 1)
            break
        }
    }

    function deleteDefenseSetup(defenseSetupIncrementId: number): void {
        for (const index in defenseSetups.value) {
            const item = defenseSetups.value[index]

            if (item.incrementId !== defenseSetupIncrementId) continue

            defenseSetups.value.splice(parseInt(index), 1)
            break
        }
    }

    function importDefenses(importedDefenses: UserDefenseInterface[]): void {
        importedDefenses.forEach((defense: UserDefenseInterface) => {
            defense.isCollapsed = false
            defense.isUserDataCollapsed = true
            defenses.value.push(new UserDefense({
                incrementId: defense.incrementId,
                userData: defense,
                userShards: [],
                userMods: [],
            }))
        })

        loadDefenseData()
        loadModData()
        loadShardData()
    }

    function importDefenseSetups(setups: UserDefenseSetupInterface[]): void {
        defenseSetups.value = defenseSetups.value.concat(dataMigration.migrateDefenseSetups(setups))
    }

    // Persist defense data on change
    watch(defenses, () => {
        localStorage.setItem('defenses', JSON.stringify(defenses.value
            .filter((defense: UserDataStoreDefenseInterface) => defense.userData)
            .map((defense: UserDataStoreDefenseInterface) => defense.userData))
        )
    }, { deep: true })

    // Persist defense setup data on change
    watch(defenseSetups, () => {
        localStorage.setItem('defenseSetups', JSON.stringify(defenseSetups.value))
    }, { deep: true })

    // Persist ancient power data on change
    watch(ancientPowerPoints, () => {
        localStorage.setItem('ancientResetPoints', JSON.stringify(ancientPowerPoints.value))
    }, { deep: true })

    watch(tableHeaders, () => {
        localStorage.setItem('tableHeaders', JSON.stringify(tableHeaders.value))
    }, { deep: true })

    watch(tableView, () => {
        localStorage.setItem('tableView', tableView.value ? 'true' : 'false')
    })

    watch(lastVisitedVersion, () => {
        localStorage.setItem('lastVisitedVersion', lastVisitedVersion.value)
    })

    return { isDev, tableHeaders, tableView, lastVisitedVersion, defenses, defenseSetups, ancientPowerPoints, deleteDefense, deleteDefenseSetup, getNextDefenseIncrementId, getNextDefenseSetupIncrementId, importDefenses, importDefenseSetups }
})

export function getDefaultSetupModifiers(): DefenseSetupModifiersInterface {
    return {
        combos: {
            petrify: false,
            ignite: false,
            electrocute: false,
            shatter: false,
        },
        enemyType: {
            frost: false,
        },
        laneMutators: {
            armored: false,
            berserked: false,
            reckless: false,
            softSpot: false,
            spellbreaker: false,
        },
        heroBuffs: {
            talisman: false,
            talismanChiSupercharge: false,
            talismanChiBurst: false,
            callToArms: false,
            callToArmsInspiredShout: false,
            eruption: false,
            eruptionTwiceAsBright: false,
            radiantPower: 0,
            radiantCriticalPower: 0,
        }
    }
}
