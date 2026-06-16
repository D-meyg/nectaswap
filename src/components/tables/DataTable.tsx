import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { memo, useCallback, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  loading?: boolean;
  error?: string | null;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  selectable?: boolean;
  onSelectionChange?: (rows: TData[]) => void;
  emptyTitle?: string;
  emptyMessage?: string;
  toolbar?: React.ReactNode;
  stickyHeader?: boolean;
  className?: string;
}

const DEFAULT_PAGE_SIZE = 10;

const SortIcon = memo(function SortIcon({
  state,
}: {
  state: "asc" | "desc" | false;
}) {
  if (state === "asc") {
    return <ChevronUp size={14} className="text-[var(--color-brand)]" />;
  }

  if (state === "desc") {
    return <ChevronDown size={14} className="text-[var(--color-brand)]" />;
  }

  return (
    <ChevronsUpDown size={14} className="text-[var(--color-text-muted)]" />
  );
});

function TableSkeleton({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-[var(--color-border)]">
          {Array.from({ length: columns }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-5 py-4">
              <div className="h-4 w-full max-w-[140px] animate-pulse rounded bg-[var(--color-border)]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function DataTable<TData>({
  data,
  columns,
  loading,
  error,
  total,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  onPageChange,
  selectable,
  onSelectionChange,
  emptyTitle = "No results",
  emptyMessage = "No records found for the current filters.",
  toolbar,
  stickyHeader,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const memoColumns = useMemo(() => columns, [columns]);

  const table = useReactTable({
    data,
    columns: memoColumns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater);

      if (!onSelectionChange) return;

      const next =
        typeof updater === "function" ? updater(rowSelection) : updater;

      const selectedRows = Object.keys(next)
        .filter((key) => next[key])
        .map((key) => data[Number(key)])
        .filter(Boolean);

      onSelectionChange(selectedRows);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: selectable,
    manualPagination: Boolean(onPageChange),
    pageCount: total ? Math.ceil(total / pageSize) : undefined,
  });

  const totalPages = total ? Math.ceil(total / pageSize) : 1;

  const handlePrev = useCallback(() => {
    if (page > 1) onPageChange?.(page - 1);
  }, [onPageChange, page]);

  const handleNext = useCallback(() => {
    if (page < totalPages) onPageChange?.(page + 1);
  }, [onPageChange, page, totalPages]);

  return (
    <div className={cn("flex flex-col w-full", className)}>
      {toolbar && (
        <div className="border-b border-[var(--color-border)] bg-white px-5 py-4">
          {toolbar}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead
            className={cn(
              "bg-[var(--color-bg-subtle)]",
              stickyHeader && "sticky top-0 z-10",
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="h-[44px] border-b border-[var(--color-border)]"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                      "whitespace-nowrap px-5 py-3 text-left align-middle",
                      header.column.getCanSort() &&
                        "cursor-pointer select-none hover:bg-[rgba(0,0,0,0.02)] transition-colors",
                    )}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="font-geom text-[11px] font-semibold uppercase leading-none tracking-[0.05em] text-[var(--color-text-tertiary)]">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </span>

                      {header.column.getCanSort() && (
                        <SortIcon state={header.column.getIsSorted()} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="bg-white">
            {loading ? (
              <TableSkeleton columns={columns.length} />
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center">
                  <Text variant="caption" color="danger">
                    {error}
                  </Text>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center">
                  <Text variant="subtitle" color="primary" weight="semibold">
                    {emptyTitle}
                  </Text>

                  <Text variant="caption" color="tertiary" className="mt-1">
                    {emptyMessage}
                  </Text>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "h-[64px] border-b border-[var(--color-border)] last:border-b-0",
                    "transition-colors hover:bg-[var(--color-bg-subtle)]",
                    row.getIsSelected() && "bg-[rgba(78,43,204,0.04)]",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="whitespace-nowrap px-5 py-3 align-middle"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {onPageChange && (
        <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] bg-white px-5 py-4">
          <Text variant="caption" color="tertiary">
            {total
              ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(
                  page * pageSize,
                  total,
                )} of ${total}`
              : ""}
          </Text>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrev}
              disabled={page <= 1}
              className="h-[32px] px-3"
            >
              <ChevronLeft size={14} />
              Previous
            </Button>

            <span className="flex h-[32px] min-w-[32px] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-2 font-geom text-[13px] font-semibold text-white shadow-sm">
              {page}
            </span>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleNext}
              disabled={page >= totalPages}
              className="h-[32px] px-3"
            >
              Next
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
