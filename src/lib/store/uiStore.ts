import { create } from "zustand";

export type DialogName = "import" | "export" | "savePreset";

interface UiState {
  dialog: DialogName | null;
  openDialog: (dialog: DialogName) => void;
  closeDialog: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  dialog: null,
  openDialog: (dialog) => set({ dialog }),
  closeDialog: () => set({ dialog: null }),
}));
