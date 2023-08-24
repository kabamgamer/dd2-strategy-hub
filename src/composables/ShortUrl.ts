export function useShortUrl(): any {
    async function shortenUrl(url: string): Promise<string> {
        const response = await fetch(import.meta.env.VITE_TINYURL_API_URL, {
            method: "POST",
            headers: {
                "Accept": "*/*",
                "Authorization": "Bearer " + import.meta.env.VITE_TINYURL_API_KEY,
                "Content-Type": "application/json",
            },
            referrerPolicy: "no-referrer",
            body: JSON.stringify({
                url,
                "domain": import.meta.env.VITE_TINYURL_DOMAIN
            }),
        });
        const { data } = await response.json();

        if (data && data.tiny_url) {
            return data.tiny_url;
        }

        return url
    }

    return { shortenUrl }
}
