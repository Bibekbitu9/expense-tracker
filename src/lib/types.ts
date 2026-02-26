export interface Expense {
    date: string;
    category: string;
    amount: number;
    note: string;
    month: string;
    year: number;
}

export const CATEGORIES = [
    '10 mins delivery',
    'Myntra/Meesho',
    'Food Delivery',
    'Outside Food',
    'Meat/Fish',
    'Fruits',
    'Vegetables',
    'Bigbasket/Jio-Mart & Milk',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const BUDGET_LIMIT = 100000; // ₹1,00,000

export const CATEGORY_COLORS = [
    '#818cf8', '#a78bfa', '#c084fc', '#e879f9',
    '#f472b6', '#fb7185', '#fb923c', '#34d399',
];

export const MONTH_ORDER = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
