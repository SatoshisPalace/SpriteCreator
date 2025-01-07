import React, { useState, useEffect } from 'react';
import { getPurchaseOptions, TokenOption, formatTokenAmount } from '../utils/aoHelpers';
import { Gateway } from '../constants/spriteAssets';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (selectedToken: TokenOption) => Promise<void>;
  contractIcon?: string;
  contractName?: string;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ 
  isOpen, 
  onClose, 
  onPurchase,
  contractName = "Unlock Skin Customization"
}) => {
  const [options, setOptions] = useState<TokenOption[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const purchaseOptions = await getPurchaseOptions();
        setOptions(purchaseOptions);
        if (purchaseOptions.length > 0) {
          setSelectedToken(purchaseOptions[0]);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load purchase options');
      }
    };

    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  const handlePurchase = async () => {
    if (!selectedToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await onPurchase(selectedToken);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg p-6 rounded-2xl shadow-2xl bg-gradient-to-br from-[#1A0F0A] via-[#2A1912]/90 to-[#0D0705] border border-[#F4860A]/30">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#FCF5D8] hover:text-[#F4860A] transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="space-y-6">
          <div className="text-center">
            {selectedToken?.icon && (
              <img 
                src={Gateway + selectedToken.icon} 
                alt={`${selectedToken.name} Icon`} 
                className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-[#F4860A]/30"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <h3 className="text-2xl font-bold text-[#FCF5D8]">
              {contractName}
            </h3>
            <p className="mt-2 text-[#FCF5D8]/80">
              Select a payment method to purchase access
            </p>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="p-4 rounded-xl bg-[#814E33]/20 border border-[#F4860A]/30">
                <p className="text-sm text-[#FCF5D8]/70">{error}</p>
              </div>
            )}
            
            {options.map((option) => (
              <div 
                key={option.token}
                className={`p-4 rounded-xl transition-all duration-300 cursor-pointer
                  ${selectedToken?.token === option.token 
                    ? 'bg-[#814E33]/40 border-[#F4860A]/50' 
                    : 'bg-[#814E33]/20 hover:bg-[#814E33]/30 border-[#F4860A]/30'
                  } border`}
                onClick={() => setSelectedToken(option)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {option.icon && (
                      <img 
                        src={Gateway + option.icon} 
                        alt={`${option.name} icon`}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h4 className="text-lg font-semibold text-[#FCF5D8]">{option.name}</h4>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-[#F4860A]">
                    {formatTokenAmount(option.amount, option.denomination)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handlePurchase}
              disabled={loading || !selectedToken}
              className="w-full py-3 px-4 text-lg font-semibold rounded-xl 
                bg-gradient-to-r from-[#F4860A] to-[#814E33] 
                text-[#FCF5D8] shadow-lg
                hover:from-[#F4860A] hover:to-[#915E43]
                transition-all duration-300 transform hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-[#F4860A]/50
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Purchase Now'}
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 px-4 text-sm font-medium rounded-xl
                bg-[#814E33]/20 text-[#FCF5D8]/80
                hover:bg-[#814E33]/30 hover:text-[#FCF5D8]
                transition-all duration-300
                border border-[#F4860A]/30"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
