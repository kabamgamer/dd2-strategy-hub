import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { DefenseRootInterface, UserDefenseInterface } from "@/interaces";
import type { UserAncientResetPoints } from "@/data/AncientPowers";
import { useDefenseStore } from "@/stores/DefenseInfo";

export interface UserDataStoreDefenseInterface {
    incrementId: number
    userData: UserDefenseInterface,
    defenseData?: DefenseRootInterface
}

export const useUserDataStore = defineStore('userDataStore', () => {
    const { getDefenseRoot } = useDefenseStore();

    const defenses = ref<UserDataStoreDefenseInterface[]>(getDefenses())
    const ancientPowerPoints = ref<UserAncientResetPoints[]>([])

    loadDefenseData()

    function getDefenses(userDefenses?: UserDefenseInterface[]): UserDataStoreDefenseInterface[] {
        const defenses: UserDefenseInterface[] = userDefenses ?? JSON.parse(localStorage.getItem('defenses') ?? '[]')

        const allDefenses: UserDataStoreDefenseInterface[] = []
        for (const userDefense of defenses) {
            allDefenses.push({
                incrementId: userDefense.incrementId,
                userData: userDefense,
            })
        }

        return allDefenses
    }

    async function loadDefenseData(): Promise<void> {
        for (const index in defenses.value) {
            const item = defenses.value[index]

            if (defenses.value[index].defenseData) continue

            defenses.value[index].defenseData = await getDefenseRoot(item.userData.id)
        }
    }

    function updateDefense(defenseIncrementId: number, userData: UserDefenseInterface): void {
        for (const defense of defenses.value) {
            if (defense.incrementId !== defenseIncrementId) continue

            defense.userData = userData
            break
        }

        loadDefenseData()

        persistDefenses()
    }

    function deleteDefense(defenseIncrementId: number): void {
        for (const index in defenses.value) {
            const item = defenses.value[index]

            if (item.incrementId !== defenseIncrementId) continue

            defenses.value.splice(parseInt(index), 1)
            break
        }

        persistDefenses()
    }

    function persistDefenses(): void {
        localStorage.setItem('defenses', JSON.stringify(defenses.value.map((defense: UserDataStoreDefenseInterface) => defense.userData)))
    }

    return { defenses, ancientPowerPoints, updateDefense, deleteDefense }
})
