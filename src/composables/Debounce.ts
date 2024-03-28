export function useDebounce(): any {
    const debounce = <F extends ((...args: any) => any)>(func: F, waitFor: number): (...args: Parameters<F>) => ReturnType<F> => {
        const timeout: number = 0

        const debounced = (...args: any): void => {
            clearTimeout(timeout)
            setTimeout(() => func(...args), waitFor)
        }

        return debounced as (...args: Parameters<F>) => ReturnType<F>
    }

    return { debounce };
}