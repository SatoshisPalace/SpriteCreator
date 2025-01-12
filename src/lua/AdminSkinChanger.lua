-- Name: AdminSkinChanger
-- ProcessId: j7NcraZUL6GZlgdPEoph12Q5rk_dydvQDecLNxYi8rI

local json = require("json")

Initialized = Initialized or nil

TARGET_WORLD_PID = "lA4WPP5v9iUowzLJtCjZsSH_m6WV2FUbGlPSlG7KbnM"
BaseSprite = '2wRFNJg9XlCcG6jKNpDAMxX1vnHZoub998KkR0qfDjE'
BaseSpriteAtlas = 'sVIX0l_PFC6M7lYpuEOGJ_f5ESOkMxd5f5xCQSUH_2g'
BaseSpriteScale = 1.75
BaseSpriteHitbox = {width=38,height=48,offsetX=1,offsetY=22}

-- Available tokens for purchase
PurchaseTokens = {
  {
    token = 'wOrb8b_V8QixWyXZub48Ki5B6OIDyf_p1ngoonsaRpQ',  -- TRUNK token
    amount = "1984",
    name = "TRUNK",
    icon="hqg-Em9DdYHYmMysyVi8LuTGF8IF_F7ZacgjYiSpj0k",
    denomination = 3  
},
  {
    token = 'xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10',
    amount = "198400000000",
    name = "wAR",
    icon="L99jaxRKQKJt9CqoJtPaieGPEhJD3wNhR4iGqc8amXs",
    denomination = 12 
  },
  {
    token = 'OsK9Vgjxo0ypX_HLz2iJJuh4hp3I80yA9KArsJjIloU',
    amount = "10000000000",
    name = "NAB" ,
    icon="LQ4crOHN9qO6JsLNs253AaTch6MgAMbM8PKqBxs4hgI",
    denomination = 8 
  }
}

--All avalable factions
AvailableFactions = {
    {
        name = "Sky Nomads",
        description = "Masters of the skies, the Sky Nomads harness the power of wind and air to outmaneuver and outlast their opponents.",
        mascot = "Q3WBqUepXj0AQBIMAgUGwsMSKmt83JNeHAz7223Atlw",
        perks = {
            "Increased critical hit chance with wind-based attacks",
            "Reduced cooldown on special abilities",
            "Faster egg hatching time"
        }
    },
    {
        name = "Aqua Guardians",
        description = "Mystical protectors of the deep, the Aqua Guardians command the essence of water to heal and empower their allies.",
        mascot = "w_-mPdemSXZ1G-Q6fMEu6wTDJYFnJM9XePjGf_ZChgo",
        perks = {
            "Enhanced healing abilities",
            "Boost to water-type attack power",
            "Increased offspring stats during breeding"
        }
    },
    {
        name = "Inferno Blades",
        description = "Fearsome warriors of flame, the Inferno Blades unleash devastating fire-based attacks to overwhelm their foes.",
        mascot = "lnYr9oTtkRHiheQFwH4ns50mrQE6AQR-8Bvl4VfXb0o",
        perks = {
            "Chance to burn enemies on attack",
            "Boost to fire-type attack power",
            "Increased stamina recovery rate"
        }
    },
    {
        name = "Stone Titans",
        description = "Immovable defenders, the Stone Titans use their unyielding strength to outlast and overpower their adversaries.",
        mascot = "WhdcUkIGYZG4M5kq00TnUwaIt5OCGz3Q4u6_fZNktvQ",
        perks = {
            "Boost to defense stats",
            "Increased resistance to status effects",
            "Higher chance of producing rare offspring"
        }
    }
}



-- Admin wallet
ADMIN_WALLET = "dUqCbSIdkxxSuIhq8ohcQMwI-oq-CPX1Ey6qUnam0jc"

-- Initialize storage
Unlocked = Unlocked or {}
UserSkins = UserSkins or {}
UserFactions = UserFactions or {}

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

function UpdateSkin(userId, spriteTxId)
  print('Changing ' .. userId .. "'s Skin to " .. (spriteTxId or BaseSprite))

  ao.send({
    Target = TARGET_WORLD_PID,
    Tags = {
      Action = "Reality.UpdateSpriteTxId",
      EntityID = userId,
      SpriteTxId = spriteTxId or BaseSprite,
      SpriteAtlasTxId = BaseSpriteAtlas,
    --   SpriteScale = BaseSpriteScale,
    --   SpriteHitbox = BaseSpriteHitbox,
    },
    Data = json.encode({
       Scale = BaseSpriteScale,
       Hitbox = BaseSpriteHitbox
      })
  })
  print("Sent UpdateSkin to world")
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
-- Handle GetFactions action
Handlers.add(
  "GetFactions",
  Handlers.utils.hasMatchingTag("Action", "GetFactions"),
  function(msg)
    ao.send({
      Target = msg.From,
      Data = json.encode({
        result = AvailableFactions
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
      print("User " .. msg.From .. " does not have Eternal Pass")
      ao.send({
        Target = msg.From,
        Data = json.encode({
          status = "error",
          message = "You do not have Eternal Pass"
        })
      })
      return
    end
    
    local spriteTxId = msg.Tags.SpriteTxId
    assert(spriteTxId, "No sprite transaction ID provided")
    local spriteAtlasTxId = msg.Tags.SpriteAtlasTxId
    assert(spriteAtlasTxId, "No sprite atlas transaction ID provided")
    
    UpdateSkin(msg.From, spriteTxId)
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
Handlers.add(
  'SetFaction',
  Handlers.utils.hasMatchingTag('Action', 'SetFaction'),
  function(msg)
    print("Setting faction")
    print("From: " .. msg.From)
    
    -- Check if user has unlock permission
    if not UnlockedSkin(msg.From) then
      print("User " .. msg.From .. " does not have Eternal Pass")
      ao.send({
        Target = msg.From,
        Data = json.encode({
          status = "error",
          message = "You do not have Eternal Pass"
        })
      })
      return
    end
    
    local faction = msg.Tags.Faction
    assert(faction, "No faction provided")
    assert(UserFactions[msg.From] == nil, "User already has a faction")
    UserFactions[msg.From] = { faction = faction }
    print("Set user faction to: " .. faction .. " for user: " .. msg.From) 
    
    -- Send confirmation back to the user
    ao.send({
      Target = msg.From,
      Data = json.encode({
        status = "success",
        message = "Faction set successfully",
        faction = faction
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

-- Handle CheckUnlocked action
Handlers.add(
  "CheckSkin",
  Handlers.utils.hasMatchingTag("Action", "CheckSkin"),
  function(msg)
    local address = ao.id
    if msg.Tags.Address then
      address = msg.Tags.Address
    end
    
    local result = UserSkins[address].txId or "None"
    
    ao.send({
      Target = msg.From,
      Data = result
    })
  end
)
Handlers.add(
  "CheckFaction",
  Handlers.utils.hasMatchingTag("Action", "CheckFaction"),
  function(msg)
    local address = ao.id
    if msg.Tags.Address then
      address = msg.Tags.Address
    end
    
    local result = UserFactions[address].faction or "None"
    
    ao.send({
      Target = msg.From,
      Data = result
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
          type = "error",
          error = "Unauthorized access"
        })
      })
      return
    end

    local data = json.decode(msg.Data)
    if not data or not data.addresses or type(data.addresses) ~= "table" then
      ao.send({
        Target = msg.From,
        Data = json.encode({
          type = "error",
          error = "Invalid input format"
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
        type = "ok",
        data = json.encode({
          successful = successful,
          failed = failed
        })
      })
    })
  end
)


-- Function to remove a user from the unlocked list
function RemoveUserFromUnlocked(userId)
    for index, value in ipairs(Unlocked) do
      if value == userId then
        table.remove(Unlocked, index)
        print("Removed user from Unlocked list: " .. userId)
        return true
      end
    end
    print("User not found in Unlocked list: " .. userId)
    return false
  end
  
  -- Function to remove a user from the UserSkins list
  function RemoveUserSkin(userId)
    if UserSkins[userId] then
      UserSkins[userId] = nil
      print("Removed user's skin: " .. userId)
      return true
    end
    print("User skin not found: " .. userId)
    return false
  end
  
  -- Handler for removing a user
  Handlers.add(
    'RemoveUser',
    Handlers.utils.hasMatchingTag('Action', 'RemoveUser'),
    function(msg)
      -- Check if sender is admin
      if not IsAdmin(msg.From) then
        ao.send({
          Target = msg.From,
          Data = json.encode({
            type = "error",
            error = "Unauthorized access"
          })
        })
        return
      end
  
      local userId = msg.Tags.UserId
      if not userId then
        ao.send({
          Target = msg.From,
          Data = json.encode({
            type = "error",
            error = "No user ID specified"
          })
        })
        return
      end
  
      local unlockedRemoved = RemoveUserFromUnlocked(userId)
      local skinRemoved = RemoveUserSkin(userId)
  
      local result = {
        type = "ok",
        message = "User removal complete",
        unlockedRemoved = unlockedRemoved,
        skinRemoved = skinRemoved
      }
  
      ao.send({
        Target = msg.From,
        Data = json.encode(result)
      })
    end
  )
  

print("Loaded NEW AdminSkinChanger.lua")
