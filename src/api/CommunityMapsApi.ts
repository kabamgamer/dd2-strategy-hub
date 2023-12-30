import useApi from "@/api/Api"

const { getFromEndpoint, postAtEndpoint, patchAtEndpoint, deleteAtEndpoint } = useApi()

export default function useCommunityMapsApi(): any {
    async function getCommunityMapById(id: string): Promise<any> {
        return (await getFromEndpoint(`/maps/${id}`)).data
    }

    async function createCommunityMap(map: any): Promise<any> {
        return await postAtEndpoint('/maps', map)
    }

    async function voteCommunityMap(mapId: string, vote: string): Promise<any> {
        return await postAtEndpoint(`/maps/${mapId}/vote`, {vote})
    }

    async function updateCommunityMap(map: any): Promise<any> {
        return await patchAtEndpoint(`/maps/${map.id}`, map)
    }

    async function deleteCommunityMap(mapId: string): Promise<any> {
        return await deleteAtEndpoint(`/maps/${mapId}`)
    }

    return { getCommunityMapById, createCommunityMap, updateCommunityMap, deleteCommunityMap, voteCommunityMap }
}
