
import React, { useState, useMemo, useRef } from 'react';
import { HistoricalTrend } from '../types';

interface HistoricalTrendsChartProps {
  data: HistoricalTrend[];
}

// --- SVG Path Smoothing Helpers ---
const line = (pointA: {x:number, y:number}, pointB: {x:number, y:number}) => {
  const lengthX = pointB.x - pointA.x;
  const lengthY = pointB.y - pointA.y;
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX)
  };
};

const controlPoint = (current: {x:number, y:number}, previous: {x:number, y:number}, next: {x:number, y:number}, reverse?: boolean) => {
  const p = previous || current;
  const n = next || current;
  const smoothing = 0.2;
  const o = line(p, n);
  const angle = o.angle + (reverse ? Math.PI : 0);
  const length = o.length * smoothing;
  const x = current.x + Math.cos(angle) * length;
  const y = current.y + Math.sin(angle) * length;
  return [x, y];
};

const createSmoothPath = (points: {x:number, y:number}[]) => {
    if (points.length < 2) return '';
    return points.reduce((acc, point, i, a) => {
      if (i === 0) {
        return `M ${point.x},${point.y}`;
      }
      const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
      const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
      return `${acc} C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point.x},${point.y}`;
    }, '');
};
// --- End of SVG Path Smoothing Helpers ---


const HistoricalTrendsChart: React.FC<HistoricalTrendsChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const colors = ['#3B82F6', '#F59E0B', '#10B981']; // Blue, Orange, Green to match tooltip
  
  const { maxValue, labels, seriesPoints } = useMemo(() => {
    const allValues = data.flatMap(d => d.data.map(p => p.value));
    const maxVal = Math.max(...allValues, 1);
    const lbls = data[0]?.data.map(p => p.month) || [];
    
    const sPoints = data.map(trend => {
        return trend.data.map((point, pointIndex) => {
            const x = (pointIndex / (lbls.length - 1)) * 500;
            const y = 200 - (point.value / maxVal) * 200;
            return { x, y };
        });
    });

    return { maxValue: maxVal, labels: lbls, seriesPoints: sPoints };
  }, [data]);

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

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-bold text-white">Historical Trends</h2>
      <p className="text-gray-400 mt-1 mb-4 text-sm">Lead progression over the last 6 months.</p>
      <div className="flex-grow flex flex-col justify-between">
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative h-full w-full pl-8 pr-4"
        >
            {/* Tooltip */}
            {hoveredIndex !== null && tooltipPosition && (
              <div 
                className="absolute z-10 p-3 bg-gray-900 shadow-lg rounded-md pointer-events-none transform -translate-x-1/2 -translate-y-full"
                style={{ left: tooltipPosition.x, top: tooltipPosition.y - 10, minWidth: '160px' }}
              >
                  <p className="font-bold text-white mb-2 text-sm">{labels[hoveredIndex]}</p>
                  <ul className="space-y-1">
                      {data.map((trend, trendIndex) => (
                          <li key={trend.name} className="flex items-center justify-between text-xs">
                              <div className="flex items-center">
                                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors[trendIndex % colors.length] }}></span>
                                  <span className="text-gray-300">{trend.name}:</span>
                              </div>
                              <span className="font-semibold text-white">{trend.data[hoveredIndex].value.toLocaleString()}</span>
                          </li>
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
                        <span className="absolute -left-8 text-xs text-gray-400 -translate-y-1/2">{value.toFixed(0)}</span>
                    </div>
                )
            })}

            <svg className="w-full h-full overflow-visible" viewBox={`0 0 500 200`} preserveAspectRatio="none">
                {seriesPoints.map((points, trendIndex) => (
                    <path
                        key={data[trendIndex].name}
                        d={createSmoothPath(points)}
                        fill="none"
                        stroke={colors[trendIndex % colors.length]}
                        strokeWidth="2.5"
                    />
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
                         {seriesPoints.map((points, trendIndex) => (
                            <circle
                                key={`dot-${trendIndex}`}
                                cx={points[hoveredIndex].x}
                                cy={points[hoveredIndex].y}
                                r="4"
                                fill={colors[trendIndex % colors.length]}
                                stroke="#1F2937" 
                                strokeWidth="2"
                            />
                        ))}
                    </g>
                )}
            </svg>
        </div>
        <div className="flex justify-between mt-2 pl-8 pr-4">
            {labels.map(label => (
                <span key={label} className="text-xs text-gray-500">{label.split(' ')[0]}</span>
            ))}
        </div>
        <div className="flex justify-center space-x-4 mt-4">
          {data.map((trend, index) => (
            <div key={trend.name} className="flex items-center">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></span>
              <span className="ml-2 text-sm text-gray-300">{trend.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoricalTrendsChart;
