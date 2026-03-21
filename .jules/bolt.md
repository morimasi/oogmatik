## 2025-02-17 - [Optimized Pagination and Rendering in SheetRenderer]
**Learning:** For dynamic worksheets with many blocks, complex pagination logic and iterative block rendering were identified as major performance bottlenecks. Memoizing the `BlockRenderer` component using `React.memo` and the pagination logic using `useMemo` significantly reduces re-renders and redundant calculations.
**Action:** Always consider memoizing complex rendering loops and page distribution logic in data-heavy components.
