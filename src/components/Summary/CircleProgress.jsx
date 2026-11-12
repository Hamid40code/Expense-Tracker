import { formatPercent } from "../../lib/format.js";
import "./CircleProgress.css";

export default function CircleProgress({
    item,
    startOffset,
    circumference,
}) {
    const percentage = Math.max(0, Math.min(100, Number(item.percentage) || 0));

    if (percentage <= 0) return null;

    const isFullCircle = percentage >= 100;
    const segmentLength = (percentage / 100) * circumference;

    return (
        <circle
            className="circle-segment"
            cx="100"
            cy="100"
            r="72"
            fill="none"
            stroke={item.color}
            strokeWidth="36"
            strokeDasharray={isFullCircle
                ? `${circumference} ${circumference}`
                : `${segmentLength} ${circumference}`}
            strokeDashoffset={isFullCircle ? 0 : -startOffset}
            transform="rotate(-90 100 100)"
        >
            <title>{`${item.label}: ${formatPercent(percentage)}`}</title>
        </circle>
    );
}
