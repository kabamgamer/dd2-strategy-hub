import useApi from "@/api/Api"

const { postAtEndpoint, patchAtEndpoint } = useApi()

export default function useAuthorisationApi(): any {
    async function updateProfile(user: any): Promise<any> {
        return await patchAtEndpoint('/user', user)
    }

    async function googleLogin(response: any): Promise<any> {
        return await postAtEndpoint('/login/google', response)
    }

    async function logout(): Promise<any> {
        return await postAtEndpoint('/logout')
    }

    return { updateProfile, googleLogin, logout }
}
