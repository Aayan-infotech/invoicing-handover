import React from 'react';
import { S, C } from '../../styles/theme';

export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ 
      display: "flex", 
      borderBottom: `2px solid ${C.border}`, 
      margin: "16px 24px 0", 
      background: C.white, 
      borderRadius: "12px 12px 0 0", 
      overflow: "hidden" 
    }}>
      {tabs.map((t) => (
        <button 
          key={t.key} 
          onClick={() => onChange(t.key)} 
          style={{ 
            padding: "12px 22px", 
            border: "none", 
            cursor: "pointer", 
            fontSize: "13px", 
            fontWeight: active === t.key ? "700" : "400", 
            color: active === t.key ? C.blue : C.grey, 
            background: active === t.key ? C.blueLight : C.white, 
            borderBottom: active === t.key ? `3px solid ${C.blue}` : "3px solid transparent", 
            transition: "all 0.15s" 
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function TabContent({ children }) {
  return (
    <div style={{ 
      margin: "0 24px", 
      background: C.white, 
      borderRadius: "0 0 12px 12px", 
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)", 
      marginBottom: "24px" 
    }}>
      {children}
    </div>
  );
}