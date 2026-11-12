import type { ReactNode } from "react";
import { Modal } from "./Modal";

interface Props {
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, children, confirmLabel = "Remove", onConfirm, onCancel }: Props) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="confirm-body">{children}</div>
      <div className="form-actions">
        <button type="button" className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
