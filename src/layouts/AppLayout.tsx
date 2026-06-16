import { Outlet } from "react-router-dom";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

interface PageTitleCtx {
  title: string;
  subtitle: string;
  setPage: (title: string, subtitle: string) => void;
}

const PageTitleContext = createContext<PageTitleCtx>({
  title: "Control Room",
  subtitle: "Real-time operational awareness and platform health",
  setPage: () => {},
});

export function usePageTitle(title: string, subtitle: string) {
  const { setPage } = useContext(PageTitleContext);

  useEffect(() => {
    setPage(title, subtitle);
  }, [title, subtitle, setPage]);
}

export function useCurrentPageTitle() {
  const { title, subtitle } = useContext(PageTitleContext);
  return { title, subtitle };
}

function PageTitleProvider({ children }: { children: ReactNode }) {
  const [pageTitle, setPageTitle] = useState({
    title: "Control Room",
    subtitle: "Real-time operational awareness and platform health",
  });

  const setPage = useCallback((title: string, subtitle: string) => {
    setPageTitle((current) => {
      if (current.title === title && current.subtitle === subtitle) {
        return current;
      }

      return { title, subtitle };
    });
  }, []);

  return (
    <PageTitleContext.Provider
      value={{
        title: pageTitle.title,
        subtitle: pageTitle.subtitle,
        setPage,
      }}
    >
      {children}
    </PageTitleContext.Provider>
  );
}

export function AppLayout() {
  return (
    <PageTitleProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--color-bg-page)] font-geom text-[var(--color-text-primary)]">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar />

          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[var(--color-bg-page)]">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </PageTitleProvider>
  );
}
