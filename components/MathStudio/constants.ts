// Math Studio — A4 & Layout Constants

// A4 Portrait dimensions in pixels (96dpi)
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

// Page structure heights (px)
export const HEADER_HEIGHT = 52;
export const FOOTER_HEIGHT = 28;

// Default margins (mm → approx px)
export const DEFAULT_MARGIN = {
    top: 45,    // ~12mm
    side: 38,   // ~10mm
    bottom: 30, // ~8mm
};

// Layout constraints
export const COLS_MIN = 1;
export const COLS_MAX = 8;
export const COUNT_MIN = 1;
export const COUNT_MAX = 200;
export const FONT_SIZE_MIN = 14;
export const FONT_SIZE_MAX = 48;

// Default drill config
export const DEFAULT_DRILL_CONFIG = {
    selectedOperations: ['add'] as string[],
    digit1: 2,
    digit2: 1,
    digit3: 1,
    count: 20,
    cols: 4,
    gap: 8,
    allowCarry: true,
    allowBorrow: true,
    allowRemainder: false,
    allowNegative: false,
    useThirdNumber: false,
    showTextRepresentation: false,
    autoFillPage: false,
    orientation: 'vertical' as const,
    showAnswer: false,
    fontSize: 24,
};

// Default page config
export const DEFAULT_PAGE_CONFIG = {
    paperType: 'blank' as const,
    gridSize: 20,
    margin: 38,
    showDate: true,
    showName: true,
    title: 'MATEMATİK ÇALIŞMASI',
};

// Default problem config
export const DEFAULT_PROBLEM_CONFIG = {
    topic: 'Uzay Yolculuğu',
    count: 4,
    includeSolutionBox: true,
    studentName: '',
    difficulty: 'Orta',
    selectedOperations: ['add', 'sub'] as string[],
    numberRange: '1-20',
    problemStyle: 'simple' as const,
    complexity: '1-step' as const,
};
