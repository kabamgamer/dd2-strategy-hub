import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ModInterface } from "@/interaces";
import DefenseModData from "@/data/DefenseModData";
import type { DefenseModDataResponse } from "@/data/DefenseModData";

export const useModStore: () => any = (): object => {
    const innerStore = defineStore('modStore', () => {
        const allMods: ModInterface[] = []
        const loading = ref<boolean>(false)
        const loaded = ref<boolean>(false)

        function initialized(): Promise<void> {
            return new Promise((resolve: () => void) => {
                const interval = setInterval((): void => {
                    if (allMods.length > 0) {
                        clearInterval(interval)
                        resolve()
                    }
                }, 100)
            })
        }

        function loadMods(): void {
            if (loaded.value) return

            loading.value = true

            const url: string = 'https://opensheet.elk.sh/14fMZD5KbC4NEHOKDPjHL8DVJgvvHFZonXbvvwuFCW7Y/Defense+Mods';

            fetch(url)
                .then(res => res.json())
                .then(mods => {
                    const modCount: number = Object.keys(mods).length

                    mods.forEach((defense: DefenseModDataResponse, index: number) => {
                        const modDataObject: ModInterface = new DefenseModData(defense);

                        if (modDataObject.id !== '') {
                            allMods.push(modDataObject);
                        }

                        if (index+1 === modCount) {
                            loaded.value = true
                            loading.value = false
                        }
                    })
                })
                .catch(err => { throw err });
        }

        async function getModById(id: string): Promise<ModInterface | null> {
            await initialized()
            return Promise.resolve(allMods.find((mod: ModInterface): boolean => mod.id === id) ?? null)
        }

        async function getAllMods(): Promise<ModInterface[]> {
            await initialized()
            return Promise.resolve(allMods)
        }

        return { loading, loadMods, getModById, getAllMods }
    })

    const store = innerStore()
    if (!store.loading) {
        store.loadMods()
    }

    return store
}
