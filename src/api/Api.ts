import { storeToRefs } from "pinia"
import { useUserStore } from "@/stores/User"

export default function useApi(): any {
    async function getFromEndpoint(endpoint: string, customOptions: object = {}): Promise<any> {
        const options = {
            method: "GET",
            headers: getHeaders(),
            ...customOptions
        };

        const response = await fetch(import.meta.env.VITE_API_URL + endpoint, options)

        return await response.json()
    }

    async function postAtEndpoint(endpoint: string, body?: object, promptLoginOnUnauthorized: boolean = true): Promise<any> {
        const options: {method: string, headers: { [key: string]: string }, body?: string} = {
            method: "POST",
            headers: getHeaders(),
        }

        if (body) options['body'] = JSON.stringify(body)

        const response = await fetch(import.meta.env.VITE_API_URL + endpoint, options as RequestInit)

        if (response.status === 401 && promptLoginOnUnauthorized) {
            await useUserStore().promptUserLogin()

            return postAtEndpoint(endpoint, body, false)
        }

        if (response.status === 204) {
            return response
        }

        return await response.json()
    }

    async function patchAtEndpoint(endpoint: string, body?: object): Promise<any> {
        const options: {method: string, headers: { [key: string]: string }, body?: string} = {
            method: "PATCH",
            headers: getHeaders(),
        }

        if (body) options['body'] = JSON.stringify(body)

        const response = await fetch(import.meta.env.VITE_API_URL + endpoint, options as RequestInit)

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
