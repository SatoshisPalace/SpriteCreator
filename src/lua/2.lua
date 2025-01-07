-- Name: AdminSkinChanger
-- ProcessId: j7NcraZUL6GZlgdPEoph12Q5rk_dydvQDecLNxYi8rI

local json = require("json")

Initialized = Initialized or nil

TARGET_WORLD_PID = "lA4WPP5v9iUowzLJtCjZsSH_m6WV2FUbGlPSlG7KbnM"
BaseSprite = '2wRFNJg9XlCcG6jKNpDAMxX1vnHZoub998KkR0qfDjE'
BaseSpriteAtlas = 'sVIX0l_PFC6M7lYpuEOGJ_f5ESOkMxd5f5xCQSUH_2g'

-- Available tokens for purchase
PurchaseTokens = {
  {
    token = 'wOrb8b_V8QixWyXZub48Ki5B6OIDyf_p1ngoonsaRpQ',  -- TRUNK token
    amount = "1",
    name = "TRUNK",
    icon = "hqg-Em9DdYHYmMysyVi8LuTGF8IF_F7ZacgjYiSpj0k",
    denomination = 3
  },
  {
    token = 'xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10',
    amount = "198400000000",
    name = "wAR",
    icon = "L99jaxRKQKJt9CqoJtPaieGPEhJD3wNhR4iGqc8amXs",
    denomination = 12
  },
  {
    token = 'OsK9Vgjxo0ypX_HLz2iJJuh4hp3I80yA9KArsJjIloU',
    amount = "1000000000",
    name = "NAB",
    icon = "LQ4crOHN9qO6JsLNs253AaTch6MgAMbM8PKqBxs4hgI",
    denomination = 8
  }
}

-- Admin wallet
ADMIN_WALLET = "dUqCbSIdkxxSuIhq8ohcQMwI-oq-CPX1Ey6qUnam0jc"

-- Initialize storage
Unlocked = Unlocked or {}
UserSkins = UserSkins or {}

-- Function to check if a value exists in a table
function UnlockedSkin(value)
  for _, v in pairs(Unlocked) do
    if v == value then
      return true
    end
  end
  return false
end

function IsAdmin(userId)
  return userId == ADMIN_WALLET
end

function UpdateSkin(userId, spriteTxId,spriteAtlasTxId)
  print('Changing ' .. userId .. "'s Skin to " .. (spriteTxId or BaseSprite))

  ao.send({
    Target = TARGET_WORLD_PID,
    Tags = {
      Action = "Reality.UpdateSpriteTxId",
      EntityID = userId,
      SpriteTxId = spriteTxId or BaseSprite,
      SpriteAtlasTxId = spriteAtlasTxId or BaseSpriteAtlas
    }
  })
end

-- Handle GetPurchaseOptions action
Handlers.add(
  "GetPurchaseOptions",
  Handlers.utils.hasMatchingTag("Action", "GetPurchaseOptions"),
  function(msg)
    ao.send({
      Target = msg.From,
      Data = json.encode({
        result = PurchaseTokens
      })
    })
    return "ok"
  end
)

-- Handler to get user's current skin
Handlers.add(
  'GetUserSkin',
  Handlers.utils.hasMatchingTag('Action', 'GetUserSkin'),
  function(msg)
    local targetWallet = msg.Tags.Wallet
    if not targetWallet then
      return ao.send({
        Target = msg.From,
        Data = json.encode({ error = "No wallet specified" })
      })
    end
    
    local response = UserSkins[targetWallet] or {}
    ao.send({
      Target = msg.From,
      Data = json.encode(response)
    })
  end
)

-- New handler to get list of authorized users
Handlers.add(
  'GetAuthorizedUsers',
  Handlers.utils.hasMatchingTag('Action', 'GetAuthorizedUsers'),
  function(msg)
    ao.send({
      Target = msg.From,
      Data = json.encode(Unlocked)
    })
  end
)

-- Modified update skin handler
Handlers.add(
  'UpdateSprite',
  Handlers.utils.hasMatchingTag('Action', 'UpdateSprite'),
  function(msg)
    print("Updating sprite")
    print("From: " .. msg.From)
    
    -- Check if user has unlock permission
    if not UnlockedSkin(msg.From) then
      print("User " .. msg.From .. " does not have skin changing ability unlocked")
      ao.send({
        Target = msg.From,
        Data = json.encode({
          status = "error",
          message = "You do not have skin changing ability unlocked"
        })
      })
      return
    end
    
    local spriteTxId = msg.Tags.SpriteTxId
    assert(spriteTxId, "No sprite transaction ID provided")
    local spriteAtlasTxId = msg.Tags.SpriteAtlasTxId
    assert(spriteAtlasTxId, "No sprite atlas transaction ID provided")
    
    UpdateSkin(msg.From, spriteTxId,spriteAtlasTxId)
    UserSkins[msg.From] = { txId = spriteTxId }
    print("Updated user skin to: " .. spriteTxId .. " " .. spriteAtlasTxId .. " for user: " .. msg.From) 
    
    -- Send confirmation back to the user
    ao.send({
      Target = msg.From,
      Data = json.encode({
        status = "success",
        message = "Sprite updated successfully",
        txId = spriteTxId
      })
    })
  end
)

-- Modified credit notice handler
Handlers.add(
  "CreditNoticeHandler",
  Handlers.utils.hasMatchingTag("Action", "Credit-Notice"),
  function(msg)
    print("credit-notice")
    local userId = msg.Tags.Sender
    local quantity = tonumber(msg.Tags.Quantity)
    local token = msg.From

    -- Check if the token and amount match any of our purchase options
    local validPurchase = false
    for _, option in ipairs(PurchaseTokens) do
      if token == option.token and quantity == tonumber(option.amount) then
        validPurchase = true
        break
      end
    end

    if not validPurchase then
      print("Returning tokens - incorrect amount or token")
      ReturnTokens(msg.From, userId, quantity)
      return
    end

    local message
    if UnlockedSkin(userId) then
      message = "Thank you for the donation!"
    else
      table.insert(Unlocked, userId)
      message = "Thank you for purchasing skin changing ability!"
    end

    ao.send({
      Target = TARGET_WORLD_PID,
      Tags = {
        Action = "ChatMessage",
        ['Author-Name'] = 'SkinChanger',
        Recipient = userId
      },
      Data = message
    })
  end
)

-- Handle CheckUnlocked action
Handlers.add(
  "CheckUnlocked",
  Handlers.utils.hasMatchingTag("Action", "CheckUnlocked"),
  function(msg)
    local address = ao.id
    if msg.Tags.Address then
      address = msg.Tags.Address
    end
    
    local result = {
      result = UnlockedSkin(address)
    }
    
    ao.send({
      Target = msg.From,
      Data = json.encode(result)
    })
  end
)

-- Handler for bulk address import
Handlers.add(
  'BulkImportAddresses',
  Handlers.utils.hasMatchingTag('Action', 'BulkImportAddresses'),
  function(msg)
    -- Check if sender is admin
    if not IsAdmin(msg.From) then
      ao.send({
        Target = msg.From,
        Data = json.encode({
          status = "error",
          message = "Unauthorized access"
        })
      })
      return
    end

    local data = json.decode(msg.Data)
    if not data or not data.function or data.function ~= "add_addresses" or not data.addresses or type(data.addresses) ~= "table" then
      ao.send({
        Target = msg.From,
        Data = json.encode({
          status = "error",
          message = "Invalid input format"
        })
      })
      return
    end

    local successful = 0
    local failed = 0

    for _, address in ipairs(data.addresses) do
      -- Validate address format (assuming Arweave address format)
      if type(address) == "string" and #address > 0 then
        if not UnlockedSkin(address) then
          table.insert(Unlocked, address)
          successful = successful + 1
        else
          failed = failed + 1  -- Address already unlocked
        end
      else
        failed = failed + 1  -- Invalid address format
      end
    end

    ao.send({
      Target = msg.From,
      Data = json.encode({
        status = "success",
        result = {
          successful = successful,
          failed = failed
        }
      })
    })
  end
)

print("Loaded NEW AdminSkinChanger.lua")
