import { ref } from 'vue'
import type { Ref } from 'vue'

export interface MetaDataComposable {
    meta: Ref<MetaTag[]>;
    add(meta: MetaTag): void;
    set: (metaKey: string, metaValue: string|string[]) => void;
    get: (metaKey: string) => undefined|MetaTag;
    resetDefaultMeta: () => void;
    setMetaTitle: (description: string) => void;
    setMetaDescription: (description: string) => void;
    setMetaKeywords: (keywords: string[]) => void;
    setMetaImage: (image: string) => void;
    setMetaUrl: (url: string) => void;
    writeMetaDataToDocumentHead: () => void;
}

interface MetaDataComposableOptions {
    titleSuffix?: string;
    titlePrefix?: string;
}

interface MetaTag {
    name: string;
    content: string|string[];
}

export function useMetaData(defaultMetaData?: { [key: string]: string|string[] }, options?: MetaDataComposableOptions): MetaDataComposable {
    const meta: Ref<MetaTag[]> = ref<MetaTag[]>([]);

    resetDefaultMeta()

    function resetDefaultMeta(): void {
        if (!defaultMetaData) {
            return;
        }

        for (const key in defaultMetaData) {
            set(key, defaultMetaData[key]);
        }
    }

    function add(meta: MetaTag): void {
        set(meta.name, meta.content);
    }

    function set(metaKey: string, metaValue: string|string[]): void {
        meta.value = meta.value.filter((meta) => meta.name !== metaKey);

        if (metaKey === 'title' && (options?.titleSuffix || options?.titlePrefix)) {
            metaValue = `${options?.titlePrefix || ''}${metaValue}${options?.titleSuffix || ''}`;
        }

        meta.value.push({ name: metaKey, content: metaValue });
    }

    function get(metaKey: string): undefined|MetaTag {
        return meta.value.find((meta) => meta.name !== metaKey);
    }

    function setMetaTitle(description: string): void {
        set('title', description);
    }

    function setMetaDescription(description: string): void {
        set('description', description);
    }

    function setMetaKeywords(keywords: string[]): void {
        set('keywords', keywords);
    }

    function setMetaImage(image: string): void {
        set('image', image);
    }

    function setMetaUrl(url: string): void {
        set('url', url);
    }

    function writeMetaDataToDocumentHead(): void {
        meta.value.forEach((metaTag) => {
            if (metaTag.name === 'title') {
                document.title = (metaTag.content) as string
            }

            let metaTagElement: null|HTMLElement = document.querySelector(`meta[name="${metaTag.name}"]`)
            if (!metaTagElement) {
                metaTagElement = document.createElement('meta')
                document.head.appendChild(metaTagElement)
            }

            metaTagElement.setAttribute('content', Array.isArray(metaTag.content) ? metaTag.content.join(', ') : metaTag.content)
        });
    }

    return { meta, add, set, get, resetDefaultMeta, setMetaTitle, setMetaDescription, setMetaKeywords, setMetaImage, setMetaUrl, writeMetaDataToDocumentHead };
}
