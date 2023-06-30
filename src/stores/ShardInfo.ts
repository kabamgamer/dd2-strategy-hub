import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ShardInterface } from "@/interaces";
import DefenseShardData from "@/data/DefenseShardData";
import type { DefenseShardDataResponse } from "@/data/DefenseShardData";
import { useGoogleSpreadsheetDataStore } from "@/stores/GoogleSpreadSheets";

export const useShardStore: () => any = (): object => {
    const innerStore = defineStore('shardStore', () => {
        const { getShards } = useGoogleSpreadsheetDataStore()

        const loading = ref(false)
        const loaded = ref(false)

        const allShards: { [hero: string]: ShardInterface[] } = {}
        const allShardsFlat: ShardInterface[] = []

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

        function loadShards(): void {
            if (loaded.value) return

            loading.value = true

            getShards().then((shards: DefenseShardDataResponse[]) => {
                const shardCount = Object.keys(shards).length

                shards.forEach((shard: DefenseShardDataResponse, index: number) => {
                    const shardDataObject: ShardInterface = new DefenseShardData(shard) as ShardInterface;

                    if (shardDataObject.id !== '') {
                        if (!allShards[shardDataObject.pack]) {
                            allShards[shardDataObject.pack] = [];
                        }

                        allShards[shardDataObject.pack].push(shardDataObject);
                        allShardsFlat.push(shardDataObject);
                    }

                    if (index+1 === shardCount) {
                        loaded.value = true
                        loading.value = false
                    }
                })
            });
        }

        async function getShardById(id: string): Promise<ShardInterface | null> {
            await initialized()
            return Promise.resolve(allShardsFlat.find((shard: ShardInterface): boolean => shard.id === id) ?? null)
        }

        async function getAllShardsCategorizedByTier(): Promise<{ [tier: string]: ShardInterface[] }> {
            await initialized()
            return Promise.resolve(allShards)
        }

        async function getAllShardsUncategorized(): Promise<ShardInterface[]> {
            await initialized()
            return Promise.resolve(allShardsFlat)
        }

        return { loading, loadShards, getShardById, getAllShardsCategorizedByTier, getAllShardsUncategorized }
    })

    const store = innerStore()
    if (!store.loading) {
        store.loadShards()
    }

    return store
}
