import { useEffect } from "react";

const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
].join(",");

export default function useModalAccessibility(dialogRef, enabled = true) {
    useEffect(() => {
        if (!enabled || !dialogRef.current) return undefined;

        const dialog = dialogRef.current;
        const previousFocus = document.activeElement;
        const previousBodyOverflow = document.body.style.overflow;
        const hadTabIndex = dialog.hasAttribute("tabindex");

        document.body.style.overflow = "hidden";

        if (!hadTabIndex) {
            dialog.setAttribute("tabindex", "-1");
        }

        const getFocusableElements = () => Array.from(
            dialog.querySelectorAll(FOCUSABLE_SELECTOR)
        ).filter((element) => !element.disabled && element.getAttribute("aria-hidden") !== "true");

        const initialFocus = dialog.querySelector("[autofocus]") || getFocusableElements()[0] || dialog;
        initialFocus.focus({ preventScroll: true });

        function handleKeyDown(event) {
            if (event.key !== "Tab") return;

            const focusableElements = getFocusableElements();

            if (focusableElements.length === 0) {
                event.preventDefault();
                dialog.focus();
                return;
            }

            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog || !dialog.contains(document.activeElement))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
                event.preventDefault();
                first.focus();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousBodyOverflow;

            if (!hadTabIndex) {
                dialog.removeAttribute("tabindex");
            }

            if (typeof HTMLElement !== "undefined" && previousFocus instanceof HTMLElement && previousFocus.isConnected) {
                previousFocus.focus({ preventScroll: true });
            }
        };
    }, [dialogRef, enabled]);
}
