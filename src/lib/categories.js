export const CATEGORY_MAP = {
    food: {
        label: "Food",
        color: "#3B82F6",
        icon: "🍔",
    },
    shopping: {
        label: "Shopping",
        color: "#F97316",
        icon: "🛍️",
    },
    transport: {
        label: "Transport",
        color: "#14B8A6",
        icon: "🚘",
    },
    entertainment: {
        label: "Entertainment",
        color: "#A855F7",
        icon: "🎮",
    },
    bills: {
        label: "Bills",
        color: "#E11D48",
        icon: "📄",
    },
    other: {
        label: "Other",
        color: "#EAB308",
        icon: "💳",
    },
};

export const EXPENSE_CATEGORIES = Object.values(CATEGORY_MAP);
export const INCOME_ICON = "💰";
export const UNKNOWN_CATEGORY_COLOR = "#06B6D4";

export function getCategoryDefinition(category) {
    const key = String(category || "other").trim().toLowerCase();
    return CATEGORY_MAP[key] || CATEGORY_MAP.other;
}

export function getCategoryColor(category) {
    const key = String(category || "").trim().toLowerCase();
    return CATEGORY_MAP[key]?.color || UNKNOWN_CATEGORY_COLOR;
}

export function getCategoryLabel(category) {
    const key = String(category || "").trim().toLowerCase();
    return CATEGORY_MAP[key]?.label || String(category || "Other").trim() || "Other";
}
