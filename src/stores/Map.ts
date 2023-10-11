import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useGoogleSpreadsheetDataStore } from "@/stores/GoogleSpreadSheets";
import type { MapDataResponse } from "@/data/MapData";
import MapData from "@/data/MapData";

export const useMapStore: () => any = (): object => {
    const innerStore = defineStore('mapStore', () => {
        const { getMaps } = useGoogleSpreadsheetDataStore()

        const loading = ref(false)
        const loaded = ref(false)

        const allMaps: { [region: string]: MapData[] } = {}
        const allMapsFlat: MapData[] = []

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

        function loadMaps(): void {
            if (loaded.value) return

            loading.value = true

            getMaps().then((maps: MapDataResponse[]) => {
                const mapCount = Object.keys(maps).length

                maps.forEach((map: MapDataResponse, index: number) => {
                    const mapDataObject: MapData = new MapData(map);

                    if (mapDataObject.id !== '') {
                        if (!allMaps[mapDataObject.region]) {
                            allMaps[mapDataObject.region] = [];
                        }

                        allMaps[mapDataObject.region].push(mapDataObject);
                        allMapsFlat.push(mapDataObject);
                    }

                    if (index+1 === mapCount) {
                        loaded.value = true
                        loading.value = false
                    }
                })
            });
        }

        async function getMapById(id: string): Promise<MapData | null> {
            await initialized()
            return Promise.resolve(allMapsFlat.find((map: MapData): boolean => map.id === id) ?? null)
        }

        async function getAllMapsCategorizedByRegion(): Promise<{ [region: string]: MapData[] }> {
            await initialized()
            return Promise.resolve(allMaps)
        }

        async function getAllMapsUncategorized(): Promise<MapData[]> {
            await initialized()
            return Promise.resolve(allMapsFlat)
        }

        return { loading, loadMaps, getMapById, getAllMapsCategorizedByRegion, getAllMapsUncategorized }
    })

    const store = innerStore()
    if (!store.loading) {
        store.loadMaps()
    }

    return store
}
