import useApi from "@/api/Api"

const { postAtEndpoint } = useApi()

export default function useAuthorisationApi() {
    async function googleLogin(response): Promise<any> {
        return await postAtEndpoint('/login/google', response)
    }

    return { googleLogin }
}
