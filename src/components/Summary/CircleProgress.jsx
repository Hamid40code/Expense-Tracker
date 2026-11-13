import "./CircleProgress.css";

const CHART_CENTER = 100;
const CHART_RADIUS = 90;
const LABEL_RADIUS = 56;

function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

function CircleProgress({ item, startAngle }) {
    const percentage = Math.min(100, Math.max(0, Number(item.percentage) || 0));

    if (percentage <= 0) return null;

    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;
    const startX = CHART_CENTER + CHART_RADIUS * Math.cos(toRadians(startAngle));
    const startY = CHART_CENTER + CHART_RADIUS * Math.sin(toRadians(startAngle));
    const endX = CHART_CENTER + CHART_RADIUS * Math.cos(toRadians(endAngle));
    const endY = CHART_CENTER + CHART_RADIUS * Math.sin(toRadians(endAngle));
    const labelAngle = startAngle + angle / 2;
    const labelX = CHART_CENTER + LABEL_RADIUS * Math.cos(toRadians(labelAngle));
    const labelY = CHART_CENTER + LABEL_RADIUS * Math.sin(toRadians(labelAngle));
    const path = `
        M ${CHART_CENTER} ${CHART_CENTER}
        L ${startX} ${startY}
        A ${CHART_RADIUS} ${CHART_RADIUS} 0 ${angle > 180 ? 1 : 0} 1 ${endX} ${endY}
        Z
    `;

    return (
        <g className="circle-progress">
            <title>{item.label}: {percentage}%</title>

            {percentage === 100 ? (
                <circle
                    cx={CHART_CENTER}
                    cy={CHART_CENTER}
                    r={CHART_RADIUS}
                    fill={item.color}
                    className="circle-segment"
                />
            ) : (
                <path
                    d={path}
                    fill={item.color}
                    className="circle-segment"
                />
            )}

            <text
                x={labelX}
                y={labelY}
                className="circle-percentage"
                textAnchor="middle"
                dominantBaseline="middle"
                aria-hidden="true"
            >
                {percentage}%
            </text>
        </g>
    );
}

export default CircleProgress;
