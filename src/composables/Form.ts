import { reactive } from 'vue'
import useApi from '@/api/Api'

import type { UnwrapNestedRefs } from 'vue'

const { postAtEndpoint, patchAtEndpoint } = useApi()

export default function useForm(data: any, resetOnSuccess: boolean = true): UnwrapNestedRefs<any> {
    const originalData = reactive(data)
    const errors = reactive({})

    return reactive<any>({
        originalData,
        errors,
        ...originalData,

        data(): any {
            const data: any = {}

            for (const property in this.originalData) {
                data[property] = this[property]
            }

            return data
        },

        load(data: any): void {
            for (const field in this.originalData) {
                this.originalData[field] = data[field]
                this[field] = data[field]
            }
        },

        reset(emptyForm: boolean = false): void {
            for (const field in this.originalData) {
                this[field] = emptyForm ? '' : this.originalData[field]
            }
        },

        post(endpoint: string): void {
            return this.submit(postAtEndpoint, endpoint)
        },

        patch(endpoint: string): void {
            return this.submit(patchAtEndpoint, endpoint)
        },

        submit(formSubmissionCallback: (endpoint: string, data: any) => Promise<any>, endpoint: string, checkChanges: boolean = true): Promise<any> {
            if (checkChanges) {
                const data = this.data()

                for (const property in data) {
                    if (data[property] !== this.originalData[property]) {
                        return this.submit(formSubmissionCallback, endpoint, false)
                    }
                }

                return Promise.resolve()
            }

            return new Promise((resolve, reject) => {
                formSubmissionCallback(endpoint, this.data())
                    .then(response => {
                        this.onSuccess(response)

                        resolve(response)
                    })
                    .catch(response => {
                        this.onFail(response)

                        reject(response)
                    })
            })
        },

        onSuccess(response: any): void {
            if (!resetOnSuccess) {
                this.load(response.data)
                return
            }

            this.reset()
        },

        onFail(errors: any): void {
            this.errors = errors
        }
    })
}
