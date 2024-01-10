import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/User";

export default function useUserMediaApi(): any {
    async function uploadMedia(file: File): Promise<any> {
        const { accessToken } = storeToRefs(useUserStore())

        if (!accessToken.value) {
            await useUserStore().promptUserLogin()

            if (!accessToken.value) {
                return
            }
        }

        const formData: FormData = new FormData();
        formData.append('file', file);

        const response: Response = await fetch(import.meta.env.VITE_API_URL + '/user/upload', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': 'Bearer ' + accessToken.value,
            }
        })

        if (!response.ok) {
            throw await response.json()
        }

        return response.json()
    }

    return { uploadMedia }
}
