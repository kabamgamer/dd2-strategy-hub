import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

export interface User {
    id: string,
    name: string,
    email: string,
    createdAt: Date,
    accessToken: string,
}

export const useUserStore = defineStore('userStore', () => {
    const user = ref<User | null>(initUser())

    const accessToken = computed<string|undefined>(() => user.value?.accessToken)

    function initUser(): User|null {
        if (!localStorage.getItem('user')) {
            return null
        }

        return JSON.parse(localStorage.getItem('user')) as User
    }

    function loginUser(loginUser: any, accessToken: string) {
        user.value = {
            id: loginUser.id,
            name: loginUser.name,
            email: loginUser.email,
            createdAt: new Date(loginUser.created_at),
            accessToken
        }
    }

    // Persist data
    watch(user, () => {
        localStorage.setItem('user', JSON.stringify(user.value))
    })

    return { user, accessToken, loginUser }
})
