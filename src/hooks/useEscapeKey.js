import { useEffect, useRef } from "react";

export default function useEscapeKey(onEscape, enabled = true) {
    const onEscapeRef = useRef(onEscape);

    useEffect(() => {
        onEscapeRef.current = onEscape;
    }, [onEscape]);

    useEffect(() => {
        if (!enabled) return undefined;

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                onEscapeRef.current?.();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [enabled]);
}
