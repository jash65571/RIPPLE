import { useEffect, useRef, type ReactNode } from 'react';

interface ModalDialogProps {
  readonly open: boolean;
  readonly labelledBy: string;
  readonly className?: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

export function ModalDialog({ open, labelledBy, className = '', onClose, children }: ModalDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog === null) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return <dialog ref={ref} className={`confirm-dialog ${className}`} aria-labelledby={labelledBy} onClose={onClose}>{children}</dialog>;
}
