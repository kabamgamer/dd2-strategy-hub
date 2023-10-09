export function useRotateElement(): any {
    function rotate(rotateElement: HTMLElement, rotateFromElement?: HTMLElement): void {
        let rotationActive: boolean = true;
        function onMouseMovement(event: MouseEvent): void {
            if (rotationActive) {
                const centerX: number = ((rotateFromElement ?? rotateElement).offsetLeft) + (rotateElement.clientWidth / 2);
                const centerY: number = ((rotateFromElement ?? rotateElement).offsetTop) + (rotateElement.clientHeight / 2);
                const mouseX: number = event.pageX;
                const mouseY: number = event.pageY;
                const radians: number = Math.atan2(mouseX - centerX, mouseY - centerY);
                const degree: number = (radians * (180 / Math.PI) * -1) + 180;

                rotateElement.style.transform = `rotate(${degree}deg)`;
            }
        }

        document.addEventListener('mousemove', onMouseMovement);
        document.addEventListener('mousedown', () => rotationActive=false);
    }

    return { rotate };
}