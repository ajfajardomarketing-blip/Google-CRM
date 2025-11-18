import React, { useMemo } from 'react';
import { GoalSettings, PlatformMetrics } from '../types';
import { monthlyHeaders } from '../data/mockData';

// --- SVG Path Curve Helper ---
const createCurvePath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) {
      if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
      return '';
    }
    
    if (points.length === 2) {
      return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
    }

    const smoothing = 0.2;
    const chartFloorY = 200;

    const lineProperties = (pointA: {x: number, y: number}, pointB: {x: number, y: number}) => {
        const lengthX = pointB.x - pointA.x;
        const lengthY = pointB.y - pointA.y;
        return {
            length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
            angle: Math.atan2(lengthY, lengthX)
        };
    };

    const controlPoint = (current: {x: number, y: number}, previous: {x: number, y: number} | undefined, next: {x: number, y: number} | undefined, reverse?: boolean) => {
        const p = previous || current;
        const n = next || current;
        const l = lineProperties(p, n);
        const angle = l.angle + (reverse ? Math.PI : 0);
        const length = l.length * smoothing;
        const x = current.x + Math.cos(angle) * length;
        const y = current.y + Math.sin(angle) * length;
        return { x, y: Math.min(y, chartFloorY) };
    };

    const bezierCommand = (point: {x: number, y: number}, i: number, a: {x: number, y: number}[]) => {
        const cps = controlPoint(a[i - 1], a[i - 2], point);
        const cpe = controlPoint(point, a[i - 1], a[i + 1], true);
        return `C ${cps.x},${cps.y} ${cpe.x},${cpe.y} ${point.x},${point.y}`;
    };

    const [firstPoint, ...otherPoints] = points;
    const d = otherPoints.reduce((acc, point, i) => `${acc} ${bezierCommand(point, i + 1, points)}`, `M ${firstPoint.x},${firstPoint.y}`);
    return d;
};
// --- End of SVG Path Helper ---

interface HistoricalEffortsChartProps {
    goals: GoalSettings;
    actualMetrics: PlatformMetrics[];
}

const effortToMetricMap: { [channel: string]: { [effort: string]: { platform: string; metric: string; } } } = {
    'Facebook': { 'Posts': { platform: 'Facebook', metric: 'FB - Posts' } },
    'LinkedIn': { 'Posts': { platform: 'LinkedIn', metric: 'LN - Posts' } },
};

const HistoricalEffortsChart: React.FC<HistoricalEffortsChartProps> = ({ goals, actualMetrics }) => {
    const colors = ['#d356f8', '#38bdf8', '#34d399', '#f59e0b'];

    const { chartData, maxValue, labels } = useMemo(() => {
        const data: { name: string; goal: number; points: number[] }[] = [];
        const allValues: number[] = [];
        
        if (goals.efforts) {
            Object.entries(goals.efforts).forEach(([channel, efforts]) => {
                Object.entries(efforts).forEach(([effortName, goalValue]) => {
                    const mapping = effortToMetricMap[channel]?.[effortName];
                    if (!mapping) return;

                    const platform = actualMetrics.find(p => p.name === mapping.platform);
                    const metric = platform?.metrics.find(m => m.name === mapping.metric);

                    if (metric) {
                        const trendData: number[] = [];
                        monthlyHeaders.forEach(month => {
                            const rawValue = metric.data[month];
                            const value = (rawValue && rawValue !== '-') ? parseFloat(String(rawValue).replace(/,/g, '')) : 0;
                            trendData.push(value);
                        });
                        
                        allValues.push(...trendData, goalValue);
                        data.push({ name: `${channel} ${effortName}`, goal: goalValue, points: trendData });
                    }
                });
            });
        }
        
        const maxVal = Math.max(...allValues, 1);
        const lbls = monthlyHeaders;

        const finalChartData = data.map(series => ({
            ...series,
            points: series.points.map((value, index) => ({
                x: (index / (lbls.length - 1)) * 500,
                y: 200 - (value / maxVal) * 200
            }))
        }));

        return { chartData: finalChartData, maxValue: maxVal, labels: lbls };

    }, [goals, actualMetrics]);
    
    if (chartData.length === 0) {
        return (
            <div className="bg-gray-900 p-4 rounded-xl shadow-lg h-full flex flex-col">
                <h2 className="text-xl font-bold text-white">Historical Content Efforts Performance</h2>
                <p className="text-gray-400 mt-1 text-sm">No effort goals set in Planning. Add goals to see historical performance.</p>
            </div>
        );
    }

    return (
         <div className="bg-gray-900 p-4 rounded-xl shadow-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-white">Historical Content Efforts Performance</h2>
            <p className="text-gray-400 mt-1 mb-4 text-sm">Monthly activity vs. goals.</p>
            <div className="flex-grow flex flex-col justify-between">
                <div className="relative w-full aspect-[10/4] max-h-80 pr-4">
                    {/* Y-Axis Lines and Labels */}
                    {[...Array(5)].map((_, i) => {
                        const value = (maxValue / 4) * (4 - i);
                        return (
                            <div key={i} className="absolute w-full" style={{ top: `${(i / 4) * 100}%`, left: 0 }}>
                                <div className="w-full border-t border-gray-700 border-dashed"></div>
                                <span className="absolute left-2 text-xs text-gray-400 -translate-y-1/2">{Math.ceil(value)}</span>
                            </div>
                        )
                    })}
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                        {chartData.map((series, seriesIndex) => {
                            const goalY = 200 - (series.goal / maxValue) * 200;
                            return (
                                <g key={series.name}>
                                    <path
                                        d={createCurvePath(series.points)}
                                        fill="none"
                                        stroke={colors[seriesIndex % colors.length]}
                                        strokeWidth="2.5"
                                    />
                                    <line
                                        x1="0"
                                        y1={goalY}
                                        x2="500"
                                        y2={goalY}
                                        stroke={colors[seriesIndex % colors.length]}
                                        strokeWidth="1.5"
                                        strokeDasharray="5 5"
                                        opacity="0.6"
                                    />
                                </g>
                            );
                        })}
                    </svg>
                </div>
                 <div className="flex justify-between mt-2 pr-4">
                    {labels.map(label => (
                        <span key={label} className="text-xs text-gray-500">{label}</span>
                    ))}
                </div>
                <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mt-4">
                    {chartData.map((series, index) => (
                        <div key={series.name} className="flex items-center">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></span>
                            <span className="ml-2 text-sm text-gray-300">{series.name}</span>
                            <span className="ml-2 text-xs text-gray-500">(Goal: {series.goal})</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HistoricalEffortsChart;