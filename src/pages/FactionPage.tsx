import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { getFactionOptions, FactionOptions, setFaction } from '../utils/aoHelpers';
import { currentTheme } from '../constants/theme';
import { Gateway } from '../constants/spriteAssets';
import PurchaseModal from '../components/PurchaseModal';
import Header from '../components/Header';

const FactionPage: React.FC = () => {
  const { wallet, walletStatus, darkMode, connectWallet, setDarkMode } = useWallet();
  const [factions, setFactions] = useState<FactionOptions[]>([]);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFactions, setIsLoadingFactions] = useState(true);
  const theme = currentTheme(darkMode);

  useEffect(() => {
    const loadFactions = async () => {
      try {
        setIsLoadingFactions(true);
        const options = await getFactionOptions();
        setFactions(options || []);
      } catch (error) {
        console.error('Error loading factions:', error);
        setFactions([]);
      } finally {
        setIsLoadingFactions(false);
      }
    };

    loadFactions();
  }, []);

  const handleJoinFaction = async (factionName: string) => {
    try {
      setIsLoading(true);
      await setFaction(wallet, factionName);
      await connectWallet();
    } catch (error) {
      console.error('Error joining faction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseComplete = () => {
    setIsPurchaseModalOpen(false);
    connectWallet();
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const currentFaction = factions.find(f => f.name === walletStatus?.faction);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className={`h-screen flex flex-col ${theme.bg}`}>
        <Header
          theme={theme}
          darkMode={darkMode}
          onDarkModeToggle={() => setDarkMode(!darkMode)}
        />
        <PurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          onPurchaseComplete={handlePurchaseComplete}
          wallet={wallet}
          darkMode={darkMode}
        />

        <div className={`container mx-auto px-6 py-8 ${theme.text}`}>
          {/* Header Section */}
          <div className="max-w-6xl mx-auto mb-8">
            <h1 className={`text-3xl font-bold mb-4 ${theme.text}`}>Factions</h1>
            {walletStatus?.faction && currentFaction && (
              <div className={`p-6 rounded-xl ${theme.container} border ${theme.border} mb-8 backdrop-blur-md`}>
                <div className="flex items-center gap-6">
                  {currentFaction.mascot && (
                    <img 
                      src={`${Gateway}${currentFaction.mascot}`}
                      alt={`${currentFaction.name} Mascot`}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h2 className={`text-2xl font-bold mb-2 ${theme.text}`}>Your Faction</h2>
                    <p className={`text-xl ${theme.text}`}>{currentFaction.name}</p>
                    {currentFaction.perks && (
                      <div className="mt-2">
                        <p className={`text-sm ${theme.text} opacity-75`}>{currentFaction.perks[0]}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto">
            {isLoadingFactions ? (
              <div className={`p-6 rounded-xl ${theme.container} border ${theme.border} mb-8 backdrop-blur-md`}>
                <p className={`${theme.text}`}>Loading factions...</p>
              </div>
            ) : !walletStatus?.isUnlocked ? (
              <div className={`p-6 rounded-xl ${theme.container} border ${theme.border} mb-8 backdrop-blur-md`}>
                <h2 className={`text-xl font-bold mb-4 ${theme.text}`}>Unlock Required</h2>
                <p className={`mb-4 ${theme.text}`}>You need an Eternal Pass to join a faction.</p>
                <button
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className={`px-4 py-2 rounded-lg ${theme.buttonBg} ${theme.buttonHover} ${theme.text}`}
                >
                  Get Eternal Pass
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {factions.map((faction, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl ${theme.container} border ${theme.border} backdrop-blur-md 
                      transition-all duration-300 hover:shadow-lg
                      ${walletStatus?.faction ? 'opacity-75 hover:opacity-100' : ''} 
                      ${walletStatus?.faction === faction.name ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="flex gap-6 mb-4">
                      {faction.mascot && (
                        <img 
                          src={`${Gateway}${faction.mascot}`}
                          alt={`${faction.name} Mascot`}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className={`text-2xl font-bold mb-2 ${theme.text}`}>{faction.name}</h3>
                        <p className={`${theme.text} text-sm`}>{faction.description}</p>
                      </div>
                    </div>

                    {faction.perks && faction.perks.length > 0 && (
                      <div className={`mt-4 p-4 rounded-lg bg-opacity-10 ${theme.bg} backdrop-blur-sm`}>
                        <h4 className={`text-lg font-semibold mb-2 ${theme.text}`}>Faction Perks</h4>
                        <ul className="space-y-2">
                          {faction.perks.map((perk, perkIndex) => (
                            <li 
                              key={perkIndex}
                              className={`flex items-center gap-2 ${theme.text}`}
                            >
                              <span className="text-blue-500">•</span>
                              <span className="text-sm">{perk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!walletStatus?.faction && (
                      <button
                        onClick={() => handleJoinFaction(faction.name)}
                        disabled={isLoading}
                        className={`mt-4 w-full px-4 py-2 rounded-lg ${theme.buttonBg} ${theme.buttonHover} ${theme.text}
                          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isLoading ? 'Joining...' : 'Join Faction'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactionPage;
