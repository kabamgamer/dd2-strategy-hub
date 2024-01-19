import useApi from "@/api/Api"

const { getFromEndpoint, postAtEndpoint, patchAtEndpoint, deleteAtEndpoint } = useApi()

export default function useCommunityMapsApi(): any {
    async function getCommunityMapById(id: string): Promise<any> {
        return (await getFromEndpoint(`/maps/${id}`)).data
    }

    async function createCommunityMap(map: any): Promise<any> {
        return postAtEndpoint('/maps', map)
    }

    async function removeVoteForCommunityMap(mapId: string): Promise<any> {
        return deleteAtEndpoint(`/maps/${mapId}/vote`)
    }

    async function voteCommunityMap(mapId: string, vote: string): Promise<any> {
        return postAtEndpoint(`/maps/${mapId}/vote`, {vote})
    }

    async function updateCommunityMap(map: any): Promise<any> {
        return patchAtEndpoint(`/maps/${map.id}`, map)
    }

    async function deleteCommunityMap(mapId: string): Promise<any> {
        return deleteAtEndpoint(`/maps/${mapId}`)
    }

    return { getCommunityMapById, createCommunityMap, updateCommunityMap, deleteCommunityMap, removeVoteForCommunityMap, voteCommunityMap }
}
