import { useEffect, useId, useRef, type ReactNode } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Accessible dialog: closes on Esc or backdrop click, traps Tab focus, and restores focus on close. */
export function Modal({ title, onClose, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current!;
    const first = node.querySelector<HTMLElement>("input, textarea, select") ?? node.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? node).focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === firstEl || !node.contains(document.activeElement))) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, []);

  return (
    <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={ref} tabIndex={-1}>
        <div className="modal-head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="x" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
