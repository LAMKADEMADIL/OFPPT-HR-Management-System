import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirmation', message, loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Annuler</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>Confirmer</Button>
      </div>
    </Modal>
  );
}
