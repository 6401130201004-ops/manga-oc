import React from 'react';
import { X } from 'lucide-react';
import { CoffeeSupportCard } from './CoffeeSupportCard';

interface CoffeeDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoffeeDonationModal: React.FC<CoffeeDonationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-pink-200 shadow-2xl p-4 sm:p-5 text-slate-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-pink-100 hover:bg-pink-200 text-slate-600 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <CoffeeSupportCard />
      </div>
    </div>
  );
};
