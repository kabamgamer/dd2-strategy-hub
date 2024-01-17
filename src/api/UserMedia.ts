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

        validateFile(file)

        const formData: FormData = new FormData();
        formData.append('file', file);

        const response: Response = await fetch(import.meta.env.VITE_API_URL + '/user/upload', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': 'Bearer ' + accessToken.value,
                'Accept': 'application/json',
            }
        })

        if (!response.ok) {
            throw await response.json()
        }

        return response.json()
    }

    function validateFile(file: File): void {
        const errors: string[] = []

        if (file.size > 2000000) {
            errors.push('File size too large. Max size is 2MB.')
        }

        if (!file.type.startsWith('image/')) {
            errors.push('File type not supported. Only images are supported.')
        }

        if (errors.length > 0) {
            throw { errors }
        }
    }

    return { uploadMedia }
}
