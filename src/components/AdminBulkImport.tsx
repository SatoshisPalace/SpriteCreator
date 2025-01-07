import React, { useState } from 'react';
import { bulkImportAddresses } from '../utils/aoHelpers';

export const AdminBulkImport: React.FC = () => {
    const [addresses, setAddresses] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ successful: number; failed: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImport = async () => {
        try {
            setIsLoading(true);
            setError(null);
            setResult(null);

            const addressList = addresses
                .split('\n')
                .map(addr => addr.trim())
                .filter(addr => addr.length > 0);

            if (addressList.length === 0) {
                setError('Please enter at least one address');
                return;
            }

            const result = await bulkImportAddresses(addressList);
            setResult(result);
            setAddresses(''); // Clear the input on success
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import addresses');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-bulk-import">
            <h3>Bulk Import Addresses</h3>
            <div className="import-instructions">
                <p>Paste wallet addresses (one per line)</p>
            </div>
            <textarea
                value={addresses}
                onChange={(e) => setAddresses(e.target.value)}
                placeholder="0x123...&#10;0x456...&#10;0x789..."
                rows={10}
                className="import-textarea"
                disabled={isLoading}
            />
            {error && (
                <div className="import-error">
                    {error}
                </div>
            )}
            {result && (
                <div className="import-success">
                    Successfully imported {result.successful} addresses
                    {result.failed > 0 && ` (${result.failed} addresses failed)`}
                </div>
            )}
            <button
                onClick={handleImport}
                disabled={isLoading || !addresses.trim()}
                className="import-button"
            >
                {isLoading ? 'Importing...' : 'Import Addresses'}
            </button>
            <style jsx>{`
                .admin-bulk-import {
                    padding: 20px;
                    max-width: 600px;
                }
                .import-instructions {
                    margin-bottom: 10px;
                }
                .import-textarea {
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-family: monospace;
                }
                .import-error {
                    color: #dc3545;
                    margin-bottom: 10px;
                    padding: 10px;
                    background-color: #fce8e8;
                    border-radius: 4px;
                }
                .import-success {
                    color: #28a745;
                    margin-bottom: 10px;
                    padding: 10px;
                    background-color: #e8f5e9;
                    border-radius: 4px;
                }
                .import-button {
                    padding: 8px 16px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .import-button:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};
