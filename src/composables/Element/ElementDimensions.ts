import { reactive } from 'vue';

interface ElementDimensions {
    width: number;
    height: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
}

export function useElementDimensions(): any {
    const dimensions = reactive<ElementDimensions>({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    });

    let element: HTMLElement | null = null;

    // Update the dimensions on resize
    window.addEventListener('resize', updateDimensions);

    function parseElementDimensions(parsedElement: HTMLElement): void {
        element = parsedElement;
        new ResizeObserver(updateDimensions).observe(element)
    }

    function updateDimensions(): void {
        if (element === null) return;
        
        const viewportOffset: DOMRect = element.getBoundingClientRect();
        dimensions.width = viewportOffset.width;
        dimensions.height = viewportOffset.height;
        dimensions.top = viewportOffset.top;
        dimensions.left = viewportOffset.left;
        dimensions.right = viewportOffset.right;
        dimensions.bottom = viewportOffset.bottom;
    }
    
    return { parseElementDimensions, dimensions };
}
