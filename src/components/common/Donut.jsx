import React from 'react';
import { C } from '../../styles/theme';

export function Donut({ pct = 0 }) {
  const r = 20, cx = 26, cy = 26, sw = 4;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  const color = pct >= 100 ? C.blue : pct >= 70 ? C.green : pct >= 40 ? "#fbbc04" : "#ea4335";
  
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={sw} />
      <circle 
        cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw} 
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" 
        transform={`rotate(-90 ${cx} ${cy})`} 
      />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>
        {pct}%
      </text>
    </svg>
  );
}