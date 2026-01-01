/**
 * نافذة التسجيل
 */

import { UnifiedAuth } from '../unified-auth';

export interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: unknown) => void;
}

export function RegisterModal({ isOpen, onClose, onSuccess }: RegisterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md">
        <UnifiedAuth mode="register" onClose={onClose} onSuccess={onSuccess} />
      </div>
    </div>
  );
}

export default RegisterModal;
