import './modal.scss';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;        // Controla se o modal está visível
  onClose: () => void;    // Função chamada para fechar o modal
  children: React.ReactNode; // Conteúdo interno do modal
  title?: string;         // Título opcional do modal
}

function Modal({ isOpen, onClose, children, title }: ModalProps) {
  // Gerencia o scroll da página quando o modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Remove scroll da página
    }
    else {
      document.body.style.overflow = 'unset';  // Restaura scroll
    }

    // Cleanup: restaura scroll quando componente é desmontado
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Se não está aberto, não renderiza nada
  if (!isOpen) return null;

  // Fecha modal quando clica no fundo (backdrop)
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Usa Portal para renderizar fora da árvore DOM atual
  return createPortal(
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        {title && (
          <div className="modal-header">
            <h2>{title}</h2>
            <button className="modal-close" onClick={onClose}>
              ×
            </button>
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>,
    document.body // Renderiza direto no body
  );
}

export default Modal;