// @ts-check
import React from 'react';
import { Modal } from 'react-bootstrap';

/**
 * Dynamic Modal Form wrapper
 * @param {Object} props
 * @param {boolean} props.show
 * @param {string} props.title
 * @param {() => void} props.onClose
 * @param {(e: any) => void} props.onSubmit
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.isSubmitting]
 * @param {string} [props.submitLabel]
 * @param {'sm'|'lg'|'xl'} [props.size]
 */
export default function ModalForm({
  show,
  title,
  onClose,
  onSubmit,
  children,
  isSubmitting = false,
  submitLabel = 'Simpan Perubahan',
  size = 'lg',
}) {
  return (
    <Modal show={show} onHide={onClose} size={size} centered contentClassName="glass-panel border-secondary border-opacity-25 text-light">
      <form onSubmit={onSubmit}>
        <Modal.Header closeButton closeVariant="white" className="border-secondary border-opacity-25 px-4 py-3">
          <Modal.Title className="fs-5 fw-bold brand-title text-white d-flex align-items-center gap-2">
            <i className="bi bi-sliders text-primary"></i>
            {title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-4 py-3">
          {children}
        </Modal.Body>

        <Modal.Footer className="border-secondary border-opacity-25 px-4 py-3">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary d-flex align-items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting && <span className="spinner-border spinner-border-sm" role="status" />}
            {submitLabel}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
