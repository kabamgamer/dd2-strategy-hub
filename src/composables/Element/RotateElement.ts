export function useRotateElement(emit?: any, event?: string): any {
    function rotate(rotateElement: HTMLElement): void {
        let degree: number = 0;
        function onMouseMovement(event: MouseEvent): void {
            const viewportOffset: DOMRect = rotateElement.getBoundingClientRect()
            const centerX: number = viewportOffset.left + (rotateElement.clientWidth / 2);
            const centerY: number = viewportOffset.top + (rotateElement.clientHeight / 2);
            const mouseX: number = event.pageX;
            const mouseY: number = event.pageY;
            const radians: number = Math.atan2(mouseX - centerX, mouseY - centerY);
            degree = (radians * (180 / Math.PI) * -1) + 180;

            rotateElement.style.transform = `rotate(${degree}deg)`;
        }

        document.addEventListener('mousemove', onMouseMovement);
        document.addEventListener('mousedown', () => {
            document.removeEventListener('mousemove', onMouseMovement)
            if (emit && event) {
                emit(event, degree)
            }
        });
    }

    return { rotate };
}
