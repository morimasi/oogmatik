Paper Size & Print Margin - Test Plan

Overview

- Verify dynamic paper size support (A4, Letter, Legal) and consistency of top/bottom margins across multi-page prints.
- Validate that print-related UI elements (right panel, SVGs, images) render correctly or hide as required on print.

Test Scenarios

1. Two pages on A4

- Steps: Set paper size A4, create content spanning 2 pages, print to PDF.
- Expected: Each page has consistent top/bottom margins (as defined for A4: top 15mm, bottom 10mm). No content overlap at page breaks.

2. Four pages on Letter

- Steps: Create content spanning 4 pages, set paper size Letter, print to PDF.
- Expected: Margins per Letter (top 12mm, bottom 12mm) preserved on every page; no overflow.

3. Three pages on Legal

- Steps: Create content spanning 3 pages, set paper size Legal, print to PDF.
- Expected: Margins per Legal (top 15mm, bottom 15mm) preserved; content layout stable.

4. Right panel visibility in print

- Steps: Print with various content; verify that right-side panels marked as no-print do not appear in print output.
- Expected: No-print elements are hidden in print output.

5. Graphic fidelity

- Steps: Include images/SVGs in content; print to PDF on all three paper sizes; verify scaling and clarity.
- Expected: Images and SVGs render sharply with correct scaling; no clipping.

6. Large content and grid integrity

- Steps: Print a large grid or table that spans multiple pages; verify header margins are not overlapped by content breaks.
- Expected: Margins preserved at each page boundary; grid borders remain crisp.

Notes

- If any discrepancy occurs, capture the PDF, take a screenshot of the printed page, and log the page number and observed margin values.
- Use the browser's print-preview for quick checks before saving to PDF.
