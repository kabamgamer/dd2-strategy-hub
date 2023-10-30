import useApi from "@/api/Api"

const { getFromEndpoint, postAtEndpoint, patchAtEndpoint } = useApi()

export default function useCommunityMapsApi() {
    async function getCommunityMapById(id): Promise<any> {
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

    return { getCommunityMapById, createCommunityMap, updateCommunityMap, voteCommunityMap }
}
