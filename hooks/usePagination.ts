// hooks/usePagination.ts
import { useState, useMemo } from "react";

export const usePagination = (data: any[], initialRowsPerPage = 10) => {
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(initialRowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
  }, [data, page, rowsPerPage]);

  return { page, setPage, rowsPerPage, setRowsPerPage, paginatedData };
};
