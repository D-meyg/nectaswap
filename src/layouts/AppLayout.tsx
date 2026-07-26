import { Outlet } from "react-router-dom";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

interface PageTitleCtx {
  title: string;
  subtitle: string;
  actions: ReactNode;
  setPage: (title: string, subtitle: string) => void;
  setActions: (actions: ReactNode) => void;
}

const PageTitleContext = createContext<PageTitleCtx>({
  title: "Control Room",
  subtitle: "Real-time operational awareness and platform health",
  actions: null,
  setPage: () => {},
  setActions: () => {},
});

export function usePageTitle(title: string, subtitle: string) {
  const { setPage } = useContext(PageTitleContext);

  useEffect(() => {
    setPage(title, subtitle);
  }, [title, subtitle, setPage]);
}

/**
 * usePageActions — call at the top of a page component to render
 * action buttons in the TopBar (e.g. "Export Report", "Back").
 * Pass a memoized node (useMemo) so the effect doesn't loop.
 * Actions are cleared automatically when the page unmounts.
 */
export function usePageActions(actions: ReactNode) {
  const { setActions } = useContext(PageTitleContext);

  useEffect(() => {
    setActions(actions);
    return () => setActions(null);
  }, [actions, setActions]);
}

export function useCurrentPageTitle() {
  const { title, subtitle, actions } = useContext(PageTitleContext);
  return { title, subtitle, actions };
}

function PageTitleProvider({ children }: { children: ReactNode }) {
  const [pageTitle, setPageTitle] = useState({
    title: "Control Room",
    subtitle: "Real-time operational awareness and platform health",
  });

  const [actions, setActionsState] = useState<ReactNode>(null);

  const setPage = useCallback((title: string, subtitle: string) => {
    setPageTitle((current) => {
      if (current.title === title && current.subtitle === subtitle) {
        return current;
      }

      return { title, subtitle };
    });
  }, []);

  const setActions = useCallback((next: ReactNode) => {
    setActionsState(next);
  }, []);

  return (
    <PageTitleContext.Provider
      value={{
        title: pageTitle.title,
        subtitle: pageTitle.subtitle,
        actions,
        setPage,
        setActions,
      }}
    >
      {children}
    </PageTitleContext.Provider>
  );
}

export function AppLayout() {
  const location = useLocation();

  return (
    <PageTitleProvider>
      <div className="flex h-screen overflow-hidden bg-(--color-bg-page) font-geom text-(--color-text-primary)">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar />

          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-(--color-bg-page)">
            <ErrorBoundary key={location.pathname}>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </PageTitleProvider>
  );
}
