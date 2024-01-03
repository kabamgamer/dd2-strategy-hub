export default function useCdn(): any {

    const CDN_DOMAIN: string = import.meta.env.VITE_CDN_DOMAIN as string;

    function cdn(path: string): string {
        return CDN_DOMAIN + '/' + path;
    }

    return { cdn };
}
