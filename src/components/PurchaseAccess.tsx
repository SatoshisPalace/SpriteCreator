import React, { useState, useEffect } from 'react';
import { getPurchaseOptions, purchaseAccess, TokenOption } from '../utils/aoHelpers';

interface PurchaseAccessProps {
    wallet: any;
    onPurchaseComplete?: () => void;
}

const PurchaseAccess: React.FC<PurchaseAccessProps> = ({ wallet, onPurchaseComplete }) => {
    const [options, setOptions] = useState<TokenOption[]>([]);
    const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPurchaseOptions();
    }, []);

    const loadPurchaseOptions = async () => {
        try {
            const result = await getPurchaseOptions();
            if (result.error) {
                setError(result.error);
            } else {
                setOptions(result.tokens);
                if (result.tokens.length > 0) {
                    setSelectedToken(result.tokens[0]);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load purchase options');
        }
    };

    const handlePurchase = async () => {
        if (!selectedToken) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const success = await purchaseAccess(
                { address: wallet },
                selectedToken.token,
                selectedToken.amount
            );
            
            if (success) {
                onPurchaseComplete?.();
            } else {
                setError('Purchase failed');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Purchase failed');
        } finally {
            setLoading(false);
        }
    };

    if (options.length === 0 && !error) {
        return <div>Loading purchase options...</div>;
    }

    return (
        <div className="purchase-access">
            <h3>Purchase Access</h3>
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            <div className="token-selector">
                <select 
                    value={selectedToken?.token || ''}
                    onChange={(e) => {
                        const token = options.find(t => t.token === e.target.value);
                        setSelectedToken(token || null);
                    }}
                    disabled={loading}
                >
                    {options.map((option) => (
                        <option key={option.token} value={option.token}>
                            {option.name || option.token} ({option.amount})
                        </option>
                    ))}
                </select>
            </div>
            <button 
                onClick={handlePurchase}
                disabled={loading || !selectedToken}
                className="purchase-button"
            >
                {loading ? 'Processing...' : 'Purchase Access'}
            </button>
            <style jsx>{`
                .purchase-access {
                    padding: 1rem;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    max-width: 300px;
                }
                .error-message {
                    color: red;
                    margin-bottom: 1rem;
                }
                .token-selector {
                    margin-bottom: 1rem;
                }
                .token-selector select {
                    width: 100%;
                    padding: 0.5rem;
                }
                .purchase-button {
                    width: 100%;
                    padding: 0.5rem;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .purchase-button:disabled {
                    background-color: #cccccc;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default PurchaseAccess;
