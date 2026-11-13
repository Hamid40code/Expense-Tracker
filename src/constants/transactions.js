export const DEFAULT_CATEGORY = "Other";
export const DEFAULT_TRANSACTION_ICON = "💳";

export const TRANSACTION_TYPES = Object.freeze({
    EXPENSE: "expense",
    INCOME: "income",
});

export const TRANSACTION_CATEGORIES = Object.freeze([
    { value: "Food", icon: "🍔" },
    { value: "Shopping", icon: "🛍️" },
    { value: "Transport", icon: "🚘" },
    { value: "Entertainment", icon: "🎮" },
    { value: "Bills", icon: "📄" },
    { value: DEFAULT_CATEGORY, icon: DEFAULT_TRANSACTION_ICON },
]);

export const CATEGORY_COLORS = Object.freeze({
    food: "#3B82F6",
    "food & drinks": "#3B82F6",
    shopping: "#F97316",
    transport: "#14B8A6",
    entertainment: "#A855F7",
    bills: "#E11D48",
    other: "#EAB308",
});

const CATEGORY_ICONS = Object.freeze(
    Object.fromEntries(
        TRANSACTION_CATEGORIES.map(({ value, icon }) => [value, icon])
    )
);

export function getCategoryIcon(category) {
    return Object.hasOwn(CATEGORY_ICONS, category)
        ? CATEGORY_ICONS[category]
        : DEFAULT_TRANSACTION_ICON;
}

export function getCategoryColor(category) {
    const key = typeof category === "string" ? category.toLowerCase() : "";
    return Object.hasOwn(CATEGORY_COLORS, key) ? CATEGORY_COLORS[key] : "#06B6D4";
}
