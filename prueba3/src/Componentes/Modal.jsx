import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, title, message, type, onConfirm, onCancel, showCancel = false }) => {
  if (!isOpen) return null;

  const getIconByType = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'confirm':
        return '❓';
      default:
        return 'ℹ️';
    }
  };

  const getModalClass = () => {
    return `modal-content modal-${type}`;
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className={getModalClass()} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">{getIconByType()}</span>
          <h3 className="modal-title">{title}</h3>
        </div>
        
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        
        <div className="modal-footer">
          {showCancel && (
            <button 
              className="btn btn-cancel" 
              onClick={onCancel}
            >
              Cancelar
            </button>
          )}
          <button 
            className="btn btn-confirm" 
            onClick={onConfirm}
            autoFocus
          >
            {showCancel ? 'Confirmar' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;