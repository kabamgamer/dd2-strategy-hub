import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ModInterface } from "@/interaces";
import DefenseModData from "@/data/DefenseModData";
import type { DefenseModDataResponse } from "@/data/DefenseModData";
import { useGoogleSpreadsheetDataStore } from "@/stores/GoogleSpreadSheets";

export const useModStore: () => any = (): object => {
    const innerStore = defineStore('modStore', () => {
        const { getMods } = useGoogleSpreadsheetDataStore()

        const allMods: ModInterface[] = []
        const loading = ref<boolean>(false)
        const loaded = ref<boolean>(false)

        function initialized(): Promise<void> {
            if (loaded.value) return Promise.resolve();

            return new Promise((resolve: () => void) => {
                const interval = setInterval((): void => {
                    if (loaded.value) {
                        clearInterval(interval)
                        resolve()
                    }
                }, 100)
            })
        }

        function loadMods(): void {
            if (loaded.value) return

            loading.value = true

            getMods().then((mods: DefenseModDataResponse[]) => {
                const modCount: number = Object.keys(mods).length

                mods.forEach((mod: DefenseModDataResponse, index: number) => {
                    const modDataObject: ModInterface = new DefenseModData(mod);

                    if (modDataObject.id !== '') {
                        allMods.push(modDataObject);
                    }

                    if (index+1 === modCount) {
                        loaded.value = true
                        loading.value = false
                    }
                })
            });
        }

        async function getModById(id: string): Promise<ModInterface | null> {
            await initialized()
            switch (id) {
                case 'tenacity': id = 'tenacity_servo'; break;
                case 'critical_servo': id = 'critical_chance_servo'; break;
            }
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
