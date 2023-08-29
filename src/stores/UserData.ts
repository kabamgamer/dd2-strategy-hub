import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { DefenseRootInterface, UserDefenseInterface, UserDefenseSetupInterface, DefenseSetupModifiersInterface } from "@/interaces";
import type { UserAncientResetPoints } from "@/data/AncientPowers";
import DataMigrations from "@/data/DataMigrations";
import { useDefenseStore } from "@/stores/DefenseInfo";

export interface UserDataStoreDefenseInterface {
    incrementId: number
    userData: UserDefenseInterface,
    defenseData?: DefenseRootInterface
}

export const useUserDataStore = defineStore('userDataStore', () => {
    const { getDefenseRoot } = useDefenseStore();

    const dataMigration = new DataMigrations

    const colorMode = ref<string>(localStorage.getItem('colorMode') ?? 'light')
    const lastVisitedVersion = ref<string>(localStorage.getItem('lastVisitedVersion') ?? 'v0.0.0')
    const isDev = ref<boolean>(localStorage.getItem('isDev') === 'true')
    const defenses = ref<UserDataStoreDefenseInterface[]>(getDefenses())
    const defenseSetups = ref<UserDefenseSetupInterface[]>(getDefenseSetups())
    const ancientPowerPoints = ref<UserAncientResetPoints>(getAncientPowerPoints())

    loadDefenseData()

    function getDefenses(): UserDataStoreDefenseInterface[] {
        const defenses: UserDefenseInterface[] = JSON.parse(localStorage.getItem('defenses') ?? '[]')

        const allDefenses: UserDataStoreDefenseInterface[] = []
        for (const userDefense of defenses) {
            allDefenses.push({
                incrementId: userDefense.incrementId,
                userData: userDefense,
            })
        }

        return allDefenses
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
            defenses.value.push({
                incrementId: defense.incrementId,
                userData: defense,
            })
        })

        loadDefenseData()
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

    watch(colorMode, () => {
        localStorage.setItem('colorMode', colorMode.value)
    })

    watch(lastVisitedVersion, () => {
        localStorage.setItem('lastVisitedVersion', lastVisitedVersion.value)
    })

    return { isDev, colorMode, lastVisitedVersion, defenses, defenseSetups, ancientPowerPoints, deleteDefense, deleteDefenseSetup, getNextDefenseIncrementId, getNextDefenseSetupIncrementId, importDefenses, importDefenseSetups }
})

export function getDefaultSetupModifiers(): DefenseSetupModifiersInterface {
    return {
        combos: {
            petrify: false,
            ignite: false,
            electrocute: false,
            shatter: false,
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
