import { useEffect, useRef } from 'react';

export function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const cursorDotRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        const cursorDot = cursorDotRef.current;

        if (!cursor || !cursorDot) return;

        // Hide default cursor
        document.body.style.cursor = 'none';

        let mouseX = -100;
        let mouseY = -100;
        let cursorX = -100;
        let cursorY = -100;
        let isClicking = false;
        let isHovering = false;

        const onMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Update dot immediately for responsiveness
            if (cursorDot) {
                cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
            }

            // Check for hover targets
            const target = e.target as HTMLElement;
            isHovering = target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') !== null ||
                target.closest('a') !== null ||
                target.classList.contains('cursor-pointer');

            if (isHovering) {
                cursor.classList.add('hovering');
            } else {
                cursor.classList.remove('hovering');
            }
        };

        const onMouseDown = () => {
            isClicking = true;
            cursor.classList.add('clicking');
        };

        const onMouseUp = () => {
            isClicking = false;
            cursor.classList.remove('clicking');
        };

        // Smooth follow animation loop
        const animate = () => {
            // Smooth lerp for the outer ring
            const speed = 0.2;
            cursorX += (mouseX - cursorX) * speed;
            cursorY += (mouseY - cursorY) * speed;

            if (cursor) {
                cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
            }

            requestAnimationFrame(animate);
        };

        const animationId = requestAnimationFrame(animate);

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);

        return () => {
            document.body.style.cursor = 'auto';
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <>
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-8 h-8 border-2 border-primary rounded-full pointer-events-none z-[9999] -ml-4 -mt-4 transition-all duration-100 ease-out flex items-center justify-center mix-blend-screen will-change-transform"
            >
                <div className="w-1 h-1 bg-primary rounded-full opacity-50" />
            </div>
            <div
                ref={cursorDotRef}
                className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] -ml-1 -mt-1 mix-blend-screen will-change-transform"
            />
            <style>{`
        .hovering {
          transform: translate3d(var(--x), var(--y), 0) scale(1.5) !important;
          border-color: #fff;
          background-color: rgba(255, 255, 255, 0.1);
        }
        .clicking {
          transform: translate3d(var(--x), var(--y), 0) scale(0.8) !important;
        }
      `}</style>
        </>
    );
}
