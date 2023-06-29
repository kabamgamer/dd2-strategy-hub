import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { DefenseRootInterface } from "@/interaces";
import DefenseData from "@/data/DefenseData";
import type { DefenseDataResponse } from "@/data/DefenseData";

export const useDefenseStore: () => any = (): object => {
    const innerStore = defineStore('defenseStore', () => {
        const loading = ref(false)
        const loaded = ref(false)

        const allDefenses: { [hero: string]: DefenseRootInterface[] } = {}
        const allDefensesFlat: DefenseRootInterface[] = []

        function initialized(): Promise<void> {
            return new Promise((resolve: () => void): void => {
                const interval = setInterval((): void => {
                    if (loaded.value) {
                        clearInterval(interval)
                        resolve()
                    }
                }, 100)
            })
        }

        function loadDefenses(): void {
            if (loaded.value) return

            loading.value = true

            const url: string = 'https://opensheet.elk.sh/1yOjZhkn9z8dJ8HMD0YSUl7Ijgd9o1KJ62Ecf4SgyTdU/Defense+Stats';

            fetch(url)
                .then(res => res.json())
                .then(defenses => {
                    const defensesCount: number = Object.keys(defenses).length

                    defenses.forEach((defense: DefenseDataResponse, index: number): void => {
                        // Check if defense name contains brackets
                        if (defense['Defense'].includes('(')) {
                            return
                        }

                        const defenseDataObject: DefenseRootInterface = new DefenseData(defense);
                        const hero: string = defense['Hero'];

                        if (defenseDataObject.id) {
                            if (!allDefenses[hero]) {
                                allDefenses[hero] = [];
                            }

                            allDefenses[hero].push(defenseDataObject);
                            allDefensesFlat.push(defenseDataObject);
                        }

                        if (index+1 === defensesCount) {
                            loaded.value = true
                            loading.value = false
                        }
                    })
                })
                .catch(err => { throw err });
        }

        async function getDefenseRoot(id: string): Promise<DefenseRootInterface | null> {
            await initialized()
            return Promise.resolve(allDefensesFlat.find((defense: DefenseRootInterface): boolean => defense.id === id) ?? null)
        }

        async function getAllDefensesCategorizedByHero(): Promise<{ [hero: string]: DefenseRootInterface[] }> {
            await initialized()
            return Promise.resolve(allDefenses)
        }

        async function getAllDefensesUncategorized(): Promise<DefenseRootInterface[]> {
            await initialized()
            return Promise.resolve(allDefensesFlat)
        }

        return { loading, loadDefenses, getDefenseRoot, getAllDefensesCategorizedByHero, getAllDefensesUncategorized }
    })

    // Make sure the store is loaded only once.
    // With the async loading, it's possible that the store is loaded multiple times.
    const store = innerStore()
    if (!store.loading) {
        store.loadDefenses()
    }

    return store
}
