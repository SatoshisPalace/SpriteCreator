declare global {
    interface Window {
        arweaveWallet: any;
    }
}

import { message, createDataItemSigner, dryrun, result } from "../config/aoConnection";
import { AdminSkinChanger, DefaultAtlasTxID } from "../constants/spriteAssets";

// Interface for wallet status
export interface WalletStatus {
    isUnlocked: boolean;
    currentSkin: string | null;
    error?: string;
    contractName?: string;
    contractIcon?: string;
    payments?: Array<{
      token: string;
      amount: string;
      name: string;
      icon?: string;
    }>;
}

interface WalletInfo {
    address: string;
}

// Interface for purchase options
export interface TokenOption {
    token: string;
    amount: string;
    name: string;
    icon?: string;
    denomination: number;
}

interface ContractResponse {
  result: {
    name: string;
    version: string;
    icon?: string;
    payments: TokenOption[];
  };
}

// Check wallet status and current skin
export const checkWalletStatus = async (walletInfo?: { address: string }): Promise<WalletStatus> => {
    try {
        // If no wallet info provided, get the active address
        const address = walletInfo?.address || await window.arweaveWallet.getActiveAddress();
        console.log("Checking wallet status for address:", address);
        
        // Check if user is unlocked
        const result = await dryrun({
            process: AdminSkinChanger,
            tags: [
                { name: "Action", value: "CheckUnlocked" },
                { name: "Address", value: address }
            ],
            data: ""
        });

        console.log("CheckUnlocked response:", result);

        if (!result.Messages || result.Messages.length === 0) {
            throw new Error("No response from CheckUnlocked");
        }

        const response = JSON.parse(result.Messages[0].Data);
        console.log("Parsed unlock status:", response);

        // Handle both old and new response formats
        const isUnlocked = response.type === "ok" ? 
            JSON.parse(response.data).result : 
            response.result === true;
            
        console.log("Final unlock status:", isUnlocked);

        return {
            isUnlocked,
            currentSkin: null,
            contractIcon: "hqg-Em9DdYHYmMysyVi8LuTGF8IF_F7ZacgjYiSpj0k",
            contractName: "Sprite Customizer"
        };
    } catch (error) {
        console.error("Error checking wallet status:", error);
        return {
            isUnlocked: false,
            currentSkin: null,
            error: "Failed to check wallet status"
        };
    }
};

// Update user's skin
export const updateUserSkin = async (wallet: any, spriteTxId: string) => {
    if (!wallet?.address) {
        throw new Error("No wallet connected");
    }

    try {
        console.log("Updating skin for wallet:", wallet.address);
        
        // First check if user is authorized
        const status = await checkWalletStatus(wallet);
        if (!status.isUnlocked) {
            throw new Error("You do not have skin changing ability unlocked.");
        }

        const result = await message({
            process: AdminSkinChanger,
            tags: [
                { name: "Action", value: "UpdateSkin" },
                { name: "SpriteTxId", value: spriteTxId },
                { name: "SpriteAtlasTxId", value: DefaultAtlasTxID }
            ],
            signer: createDataItemSigner(wallet),
            data: ""
        });

        console.log("UpdateSkin response:", result);

        if (!result.messages || result.messages.length === 0) {
            throw new Error("No response from UpdateSkin");
        }

        return result.messages[0].data;
    } catch (error) {
        console.error("Error in updateUserSkin:", error);
        throw error;
    }
};

// Get purchase schema
export const getPurchaseSchema = async (wallet: any) => {
    if (!wallet?.address) {
        throw new Error("No wallet connected");
    }

    try {
        console.log("Getting purchase schema for wallet:", wallet.address);
        
        const result = await dryrun({
            process: AdminSkinChanger,
            tags: [
                { name: "Action", value: "SchemaExternal" }
            ],
            data: ""
        });

        console.log("SchemaExternal response:", result);

        if (!result.messages || result.messages.length === 0) {
            throw new Error("No response from SchemaExternal");
        }

        return JSON.parse(result.messages[0].data);
    } catch (error) {
        console.error("Error in getPurchaseSchema:", error);
        throw error;
    }
};

// Get available purchase options
export const getPurchaseOptions = async (): Promise<TokenOption[]> => {
    try {
        console.log("Getting purchase options");
        
        const result = await dryrun({
            process: AdminSkinChanger,
            tags: [
                { name: "Action", value: "GetPurchaseOptions" }
            ],
            data: ""
        });

        console.log("GetPurchaseOptions response:", result);

        if (!result.Messages || result.Messages.length === 0) {
            throw new Error("No response from GetPurchaseOptions");
        }

        const response = JSON.parse(result.Messages[0].Data);
        console.log("Parsed response:", response);

        // The contract returns { result: [...tokens] }
        const options = response.result;
        
        if (!Array.isArray(options)) {
            console.error("Invalid options format:", options);
            throw new Error("Invalid purchase options format");
        }

        return options.map((option: any) => ({
            token: option.token,
            amount: option.amount,
            name: option.name,
            icon: option.icon,
            denomination: option.denomination || 0 // fallback to 0 if not specified
        }));
    } catch (error) {
        console.error('Error getting purchase options:', error);
        throw error;
    }
};

export const formatTokenAmount = (amount: string, denomination: number): string => {
    // Convert amount to number
    const numAmount = parseFloat(amount);
    // Divide by 10^denomination
    const formattedAmount = (numAmount / Math.pow(10, denomination)).toFixed(denomination);
    // Remove trailing zeros after decimal point
    return formattedAmount.replace(/\.?0+$/, '');
};

// Purchase access
export const purchaseAccess = async (selectedToken: TokenOption): Promise<boolean> => {
    try {
        console.log("Initiating purchase with token:", selectedToken);

        if (!window.arweaveWallet) {
            throw new Error("Arweave wallet not found");
        }

        const signer = createDataItemSigner(window.arweaveWallet);
        console.log("Created signer for wallet");

        // Send the transfer message
        const messageResult = await message({
            process: selectedToken.token, // Token contract
            tags: [
                { name: "Action", value: "Transfer" },
                { name: "Quantity", value: selectedToken.amount },
                { name: "Recipient", value: AdminSkinChanger }
            ],
            signer,
            data: "" // Empty data for transfer
        });

        console.log("Transfer message sent:", messageResult);

        // Wait for the result
        const transferResult = await result({
            message: messageResult,
            process: selectedToken.token
        });

        console.log("Transfer result:", transferResult);

        if (!transferResult.Messages || transferResult.Messages.length === 0) {
            throw new Error("No response from transfer");
        }

        // Check for error in the response
        for (const msg of transferResult.Messages) {
            const errorTag = msg.Tags?.find(tag => tag.name === "Error");
            if (errorTag) {
                throw new Error(errorTag.value);
            }

            // Check for successful transfer (Debit-Notice or Credit-Notice)
            const actionTag = msg.Tags?.find(tag => tag.name === "Action");
            if (actionTag && (actionTag.value === "Debit-Notice" || actionTag.value === "Credit-Notice")) {
                return true;
            }
        }

        // If we get here without finding success or error, something went wrong
        throw new Error("Transfer failed - no success confirmation received");

    } catch (error) {
        console.error("Error during purchase:", error);
        throw error;
    }
};

export interface BulkImportResult {
    successful: number;
    failed: number;
}

interface BulkImportRequest {
    function: string;
    addresses: string[];
}

export const bulkImportAddresses = async (data: BulkImportRequest): Promise<BulkImportResult> => {
    try {
        const signer = createDataItemSigner(window.arweaveWallet);
        console.log("Created signer for wallet");

        const response = await message({
            process: AdminSkinChanger,
            tags: [
                { name: "Action", value: "BulkImportAddresses" }
            ],
            data: JSON.stringify(data),
            signer
        });

        if (!response.data) {
            throw new Error("No response data received");
        }

        const result = JSON.parse(response.data);
        
        if (result.status === "error") {
            throw new Error(result.message);
        }

        if (result.status !== "success" || !result.result) {
            throw new Error("Unexpected response format");
        }

        return result.result;
    } catch (error) {
        console.error("Error importing addresses:", error);
        throw error;
    }
};
