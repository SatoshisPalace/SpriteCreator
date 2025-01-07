-- Bulk import handler for admin addresses
local json = require("json")

-- Function to validate Ethereum address format
local function isValidAddress(address)
    return type(address) == "string" and string.match(address, "^0x[a-fA-F0-9]{40}$") ~= nil
end

-- Function to add a single address to the purchased list
local function addPurchasedAddress(address)
    if not Handlers.isAdmin() then
        return false, "Unauthorized"
    end

    if not isValidAddress(address) then
        return false, "Invalid address format"
    end

    -- Add to purchased addresses (using your existing storage mechanism)
    local success = Handlers.addPurchasedAddress(address)
    return success
end

-- Handler for bulk address import
Handlers.BulkImportAddresses = function(msg)
    if not Handlers.isAdmin() then
        return { type = "error", error = "Unauthorized access" }
    end

    local data = json.decode(msg.data)
    if not data or not data.addresses or type(data.addresses) ~= "table" then
        return { type = "error", error = "Invalid input format" }
    end

    local successful = 0
    local failed = 0

    for _, address in ipairs(data.addresses) do
        local success = addPurchasedAddress(address)
        if success then
            successful = successful + 1
        else
            failed = failed + 1
        end
    end

    return {
        type = "ok",
        data = json.encode({
            successful = successful,
            failed = failed
        })
    }
end
