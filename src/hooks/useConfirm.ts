import { useState, useCallback } from "react";

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
}

export interface ConfirmState {
  open: boolean;
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setState({ open: true, options, resolve });
    });
  }, []);

  const respondConfirm = useCallback((value: boolean) => {
    setState(prev => {
      if (prev) prev.resolve(value);
      return null;
    });
  }, []);

  return { confirm, confirmState: state, respondConfirm };
}
