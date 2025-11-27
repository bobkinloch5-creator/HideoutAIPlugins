import { useEffect } from 'react';

export function CustomCursor() {
    useEffect(() => {
        // Hide default cursor
        document.body.style.cursor = 'none';

        // Create cursor elements
        const cursor = document.createElement('div');
        const cursorGlow = document.createElement('div');

        cursor.className = 'custom-cursor';
        cursorGlow.className = 'custom-cursor-glow';

        document.body.appendChild(cursor);
        document.body.appendChild(cursorGlow);

        // Track mouse position
        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const handleMouseDown = () => {
            cursor.style.transform = `translate(-50%, -50%) scale(0.8)`;
            cursorGlow.style.transform = `translate(-50%, -50%) scale(0.8)`;
        };

        const handleMouseUp = () => {
            cursor.style.transform = `translate(-50%, -50%) scale(1)`;
            cursorGlow.style.transform = `translate(-50%, -50%) scale(1)`;
        };

        // Smooth cursor animation
        const animate = () => {
            const speed = 0.15;
            cursorX += (mouseX - cursorX) * speed;
            cursorY += (mouseY - cursorY) * speed;

            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;
            cursorGlow.style.left = `${cursorX}px`;
            cursorGlow.style.top = `${cursorY}px`;

            requestAnimationFrame(animate);
        };

        animate();

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);

        // Cleanup
        return () => {
            document.body.style.cursor = 'auto';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
            cursor.remove();
            cursorGlow.remove();
        };
    }, []);

    return null;
}
