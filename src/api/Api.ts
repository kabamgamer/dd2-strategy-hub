import { storeToRefs } from "pinia"
import { useUserStore } from "@/stores/User"

export default function useApi() {
    async function getFromEndpoint(endpoint: string): Promise<any> {
        const response = await fetch(import.meta.env.VITE_API_URL + endpoint, {
            method: "GET",
            headers: getHeaders()
        })

        return await response.json()
    }

    async function postAtEndpoint(endpoint: string, body?: object): Promise<any> {
        const options = {
            method: "POST",
            headers: getHeaders(),
        }

        if (body) options['body'] = JSON.stringify(body)

        const response = await fetch(import.meta.env.VITE_API_URL + endpoint, options)

        return await response.json()
    }

    async function patchAtEndpoint(endpoint: string, body?: object): Promise<any> {
        const options = {
            method: "PATCH",
            headers: getHeaders(),
        }

        if (body) options['body'] = JSON.stringify(body)

        const response = await fetch(import.meta.env.VITE_API_URL + endpoint, options)

        return await response.json()
    }

    function getHeaders(): { [key: string]: string } {
        const { accessToken } = storeToRefs(useUserStore())

        const headers: { [key: string]: string } = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        };

        if (accessToken.value) headers["Authorization"] = `Bearer ${accessToken.value}`

        return headers
    }

    return { getFromEndpoint, postAtEndpoint, patchAtEndpoint }
}
