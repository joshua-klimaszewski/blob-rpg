interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-6">
      <div className="bg-paper border-2 border-ink p-6 max-w-half w-full">
        <p className="text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 min-h-touch border-2 border-ink px-4 py-2 font-bold active:bg-ink active:text-paper"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 min-h-touch border-2 border-ink px-4 py-2 font-bold bg-ink text-paper active:bg-paper active:text-ink"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
