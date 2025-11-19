

import React, { useState, useMemo, useRef } from 'react';
import { HistoricalTrend } from '../types';

interface HistoricalTrendsChartProps {
  data: HistoricalTrend[];
}

// --- SVG Path Curve Helper ---
const createCurvePath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) {
      if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
      return '';
    }
    
    // For just two points, draw a straight line
    if (points.length === 2) {
      return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
    }

    const smoothing = 0.2;
    const chartFloorY = 200; // The Y coordinate for the "0" line in the SVG

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
        // Prevent control points from dipping below the zero line
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


const HistoricalTrendsChart: React.FC<HistoricalTrendsChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    data.forEach(series => {
        initialState[series.name] = true;
    });
    return initialState;
  });
  
  const colors = ['#d356f8', '#F59E0B', '#10B981']; // Pink, Orange, Green to match tooltip
  
  const { maxValue, labels, seriesPoints } = useMemo(() => {
    // Calculate max value based on *all* data so the scale doesn't jump when series are hidden
    const allValues = data.flatMap(d => d.data.map(p => p.value));
    const maxVal = Math.max(...allValues, 1);
    const lbls = data[0]?.data.map(p => p.month) || [];
    
    // Calculate points for all series, regardless of visibility
    const sPoints = data.map(trend => {
        return trend.data.map((point, pointIndex) => {
            const x = (pointIndex / (lbls.length - 1)) * 500;
            const y = 200 - (point.value / maxVal) * 200;
            return { x, y };
        });
    });

    return { maxValue: maxVal, labels: lbls, seriesPoints: sPoints };
  }, [data]);
  
  const toggleSeries = (seriesName: string) => {
    setVisibleSeries(prev => ({
        ...prev,
        [seriesName]: !prev[seriesName],
    }));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    const chartWidth = rect.width;
    const index = Math.round(((x) / chartWidth) * (labels.length - 1));

    if (index >= 0 && index < labels.length) {
      setHoveredIndex(index);
      setTooltipPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const dataToShowInTooltip = data.filter(series => visibleSeries[series.name]);
  
  const tooltipTransformClass = useMemo(() => {
      if (!hoveredIndex || !containerRef.current) return '-translate-x-1/2';

      const rect = containerRef.current.getBoundingClientRect();
      const x = tooltipPosition.x;
      const tooltipWidth = 150; // Corresponds to min-w-[150px]

      // If the centered tooltip would overflow right, anchor it to the right of the cursor
      if (x + tooltipWidth / 2 > rect.width) {
          return '-translate-x-full -ml-2'; // Add a small margin for spacing
      }
      // If the centered tooltip would overflow left, anchor it to the left of the cursor
      if (x - tooltipWidth / 2 < 0) {
          return 'translate-x-0 ml-2'; // Add a small margin
      }
      // Default is to center it
      return '-translate-x-1/2';
  }, [hoveredIndex, tooltipPosition]);


  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-bold text-white">Historical Trends</h2>
      <p className="text-gray-400 mt-1 mb-4 text-sm">Lead progression over the last 6 months.</p>
      <div className="flex-grow flex flex-col justify-between">
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full aspect-[10/4] max-h-80 pr-4"
        >
            {/* Tooltip */}
            {hoveredIndex !== null && tooltipPosition && dataToShowInTooltip.length > 0 && (
              <div 
                className={`absolute z-10 p-2 bg-black shadow-lg rounded-md pointer-events-none transform -translate-y-full ${tooltipTransformClass}`}
                style={{ left: tooltipPosition.x, top: tooltipPosition.y - 10, minWidth: '150px' }}
              >
                  <p className="font-bold text-white mb-2 text-sm">{labels[hoveredIndex]}</p>
                  <ul className="space-y-1">
                      {data.map((trend, trendIndex) => (
                        visibleSeries[trend.name] && (
                          <li key={trend.name} className="flex items-center justify-between text-xs">
                              <div className="flex items-center">
                                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors[trendIndex % colors.length] }}></span>
                                  <span className="text-gray-300">{trend.name}:</span>
                              </div>
                              <span className="font-semibold text-white">{trend.data[hoveredIndex].value.toLocaleString()}</span>
                          </li>
                        )
                      ))}
                  </ul>
              </div>
            )}

            {/* Y-Axis Lines and Labels */}
            {[...Array(5)].map((_, i) => {
                const value = (maxValue / 4) * (4-i);
                return (
                    <div key={i} className="absolute w-full" style={{ top: `${(i / 4) * 100}%`, left: 0}}>
                        <div className="w-full border-t border-gray-700 border-dashed"></div>
                        <span className="absolute left-2 text-xs text-gray-400 -translate-y-1/2">{value.toFixed(0)}</span>
                    </div>
                )
            })}

            <svg className="w-full h-full overflow-visible" viewBox={`0 0 500 200`} preserveAspectRatio="none">
                {data.map((trend, trendIndex) => (
                    visibleSeries[trend.name] && (
                        <path
                            key={trend.name}
                            d={createCurvePath(seriesPoints[trendIndex])}
                            fill="none"
                            stroke={colors[trendIndex % colors.length]}
                            strokeWidth="2.5"
                        />
                    )
                ))}
                
                {hoveredIndex !== null && (
                    <g>
                        <line 
                            x1={seriesPoints[0][hoveredIndex].x}
                            y1={0}
                            x2={seriesPoints[0][hoveredIndex].x}
                            y2={200}
                            stroke="#4B5563"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                        />
                         {data.map((trend, trendIndex) => (
                           visibleSeries[trend.name] && (
                                <circle
                                    key={`dot-${trendIndex}`}
                                    cx={seriesPoints[trendIndex][hoveredIndex].x}
                                    cy={seriesPoints[trendIndex][hoveredIndex].y}
                                    r="4"
                                    fill={colors[trendIndex % colors.length]}
                                    stroke="#111827" 
                                    strokeWidth="2"
                                />
                            )
                        ))}
                    </g>
                )}
            </svg>
        </div>
        <div className="flex justify-between mt-2 pr-4">
            {labels.map(label => (
                <span key={label} className="text-xs text-gray-500">{label.split(' ')[0]}</span>
            ))}
        </div>
        <div className="flex justify-center space-x-2 mt-4">
          {data.map((trend, index) => (
            <button
                key={trend.name}
                onClick={() => toggleSeries(trend.name)}
                className={`flex items-center px-3 py-1 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[#d356f8] ${visibleSeries[trend.name] ? 'bg-gray-700/50' : 'opacity-40 hover:opacity-70'}`}
                aria-pressed={visibleSeries[trend.name]}
            >
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></span>
              <span className="ml-2 text-sm text-gray-300">{trend.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoricalTrendsChart;