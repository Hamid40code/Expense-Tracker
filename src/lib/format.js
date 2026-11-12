const moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
});

export function formatMoney(value) {
    const amount = Number(value);
    return moneyFormatter.format(Number.isFinite(amount) ? amount : 0);
}

export function formatPercent(value) {
    const percentage = Number(value);
    return `${percentFormatter.format(Number.isFinite(percentage) ? percentage : 0)}%`;
}
