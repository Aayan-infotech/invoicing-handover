import React from 'react';
import { S } from '../../styles/theme';

export function Modal({ title, onClose, children, footer }) {
  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={S.modalHeader}>
          <span style={S.modalTitle}>{title}</span>
          <button style={S.modalClose} onClick={onClose}>×</button>
        </div>
        <div style={S.modalBody}>{children}</div>
        {footer && <div style={S.modalFooter}>{footer}</div>}
      </div>
    </div>
  );
}