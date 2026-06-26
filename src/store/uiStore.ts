import { create } from 'zustand'

interface ModalState {
  id:      string
  props?:  Record<string, unknown>
}

interface UIState {
  sidebarOpen:   boolean
  activeModal:   ModalState | null
  selectedRows:  string[]

  toggleSidebar: () => void
  setSidebar:    (open: boolean) => void

  openModal:     (id: string, props?: Record<string, unknown>) => void
  closeModal:    () => void

  setSelectedRows:(ids: string[]) => void
  clearSelected:  () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen:  true,
  activeModal:  null,
  selectedRows: [],

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar:    (open) => set({ sidebarOpen: open }),

  openModal:  (id, props) => set({ activeModal: { id, props } }),
  closeModal: () => set({ activeModal: null }),

  setSelectedRows: (ids) => set({ selectedRows: ids }),
  clearSelected:   () => set({ selectedRows: [] }),
}))
