import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { DefenseModDataResponse } from "@/data/DefenseModData";
import type { DefenseShardDataResponse } from "@/data/DefenseShardData";
import type { DefenseDataResponse } from "@/data/DefenseData";

export const useGoogleSpreadsheetDataStore: () => any = (): object => {
    const innerStore = defineStore('googleSpreadsheetDataStore', () => {
        const mods = ref<DefenseModDataResponse[]>([])
        const shards = ref<DefenseShardDataResponse[]>([])
        const defenses = ref<DefenseDataResponse[]>([])
        const loading = ref<boolean>(false)
        const loaded = ref<boolean>(false)

        function initialized(): Promise<void> {
            return new Promise((resolve: () => void) => {
                const interval = setInterval((): void => {
                    if (loaded.value) {
                        clearInterval(interval)
                        resolve()
                    }
                }, 100)
            })
        }

        function onDataError(err: Error): void {
            const errorHandlers: { onDataError?: (err: Error) => void } = window as { onDataError?: (err: Error) => void }
            const dataErrorHandler: ((err: Error) => void) | undefined = errorHandlers["onDataError"];

            if (!dataErrorHandler) {
                throw err;
            }

            dataErrorHandler(err);
        }

        function loadData(): void {
            if (loaded.value || loading.value) return

            loading.value = true

            const url: string = import.meta.env.VITE_DATABASE_DATA_ENDPOINT as string || '';

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    mods.value = data["Defense Mods"]
                    shards.value = data["Defense Shards"]
                    defenses.value = data["Defense Stats"]

                    loaded.value = true
                    loading.value = false
                })
                .catch(err => { onDataError(err) });
        }

        async function getMods(): Promise<DefenseModDataResponse[]> {
            await initialized()
            return Promise.resolve(mods.value)
        }

        async function getShards(): Promise<DefenseShardDataResponse[]> {
            await initialized()
            return Promise.resolve(shards.value)
        }

        async function getDefenses(): Promise<DefenseDataResponse[]> {
            await initialized()
            return Promise.resolve(defenses.value)
        }

        return { loading, loadData, getMods, getShards, getDefenses }
    })

    const store = innerStore()
    if (!store.loading) {
        store.loadData()
    }

    return store
}
