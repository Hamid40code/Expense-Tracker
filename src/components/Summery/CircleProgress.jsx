
import "./CircleProgress.css";

function CircleProgress({ item, startAngle }) {

    const radius = 90;
    const center = 100;

    const percentage = Math.min(
        100,
        Math.max(0, Number(item.percentage) || 0)
    );

    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;

    const toRadians = (degrees) =>
        (degrees * Math.PI) / 180;

    const startX =
        center + radius * Math.cos(toRadians(startAngle));

    const startY =
        center + radius * Math.sin(toRadians(startAngle));

    const endX =
        center + radius * Math.cos(toRadians(endAngle));

    const endY =
        center + radius * Math.sin(toRadians(endAngle));

    const largeArc = angle > 180 ? 1 : 0;

    const path = `
        M ${center} ${center}
        L ${startX} ${startY}
        A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}
        Z
    `;

    const labelAngle = startAngle + angle / 2;
    const labelRadius = 56;

    const labelX =
        center + labelRadius * Math.cos(toRadians(labelAngle));

    const labelY =
        center + labelRadius * Math.sin(toRadians(labelAngle));

    // Don't render empty segments
    if (percentage <= 0) {
        return null;
    }

    return (
        <g
            className="circle-progress"
            style={{
                "--segment-color": item.color
            }}
        >

            <title>
                {item.label}: {percentage}%
            </title>

            {percentage === 100 ? (

                <circle
                    cx={center}
                    cy={center}
                    r={radius}
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
