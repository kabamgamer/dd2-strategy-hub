import useApi from "@/api/Api"

const { postAtEndpoint, patchAtEndpoint } = useApi()

export default function useAuthorisationApi(): any {
    async function updateProfile(user: any): Promise<any> {
        return patchAtEndpoint('/user', user)
    }

    async function googleLogin(response: any): Promise<any> {
        return postAtEndpoint('/login/google', response)
    }

    async function logout(): Promise<any> {
        return postAtEndpoint('/logout')
    }

    return { updateProfile, googleLogin, logout }
}
