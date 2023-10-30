import useApi from "@/api/Api"

const { postAtEndpoint, patchAtEndpoint } = useApi()

export default function useAuthorisationApi() {
    async function updateProfile(user): Promise<any> {
        return await patchAtEndpoint('/user', user)
    }

    async function googleLogin(response): Promise<any> {
        return await postAtEndpoint('/login/google', response)
    }

    async function logout(): Promise<any> {
        return await postAtEndpoint('/logout')
    }

    return { updateProfile, googleLogin, logout }
}
