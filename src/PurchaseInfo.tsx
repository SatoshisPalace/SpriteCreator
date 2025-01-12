import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { checkWalletStatus } from './utils/aoHelpers';
import { currentTheme } from './constants/theme';
import PurchaseAccess from './components/PurchaseAccess';
import accessTicketImg from './assets/access-ticket.png';
import logoPath from './assets/rune-realm-transparent.png';

interface PurchaseInfoProps {
  darkMode?: boolean;
  onThemeChange?: (isDark: boolean) => void;
}

const PurchaseInfo: React.FC<PurchaseInfoProps> = ({ darkMode = false, onThemeChange }) => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [theme, setTheme] = useState(currentTheme(darkMode));

  useEffect(() => {
    setTheme(currentTheme(darkMode));
  }, [darkMode]);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const handleDarkModeToggle = () => {
    onThemeChange?.(!darkMode);
  };

  const checkWalletConnection = async () => {
    try {
      const permissions = await window.arweaveWallet.getPermissions();
      if (permissions.length > 0) {
        const address = await window.arweaveWallet.getActiveAddress();
        setWalletAddress(address);
        setIsConnected(true);
        const status = await checkWalletStatus({ address });
        setIsUnlocked(status.isUnlocked);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    try {
      await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION']);
      const address = await window.arweaveWallet.getActiveAddress();
      setWalletAddress(address);
      setIsConnected(true);
      const status = await checkWalletStatus({ address });
      setIsUnlocked(status.isUnlocked);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <img 
            src={logoPath}
            alt="Rune Realm" 
            className="h-16 sm:h-20"
          />
          <div className="flex gap-4 items-center">
            <button
              onClick={handleDarkModeToggle}
              className={`py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 
                ${theme.buttonBg} ${theme.buttonHover} ${theme.text} 
                backdrop-blur-md shadow-lg hover:shadow-xl border ${theme.border}`}
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            
            <button
              onClick={isConnected ? undefined : connectWallet}
              className={`py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 
                ${isConnected ? 'bg-green-500/20 border-green-500/30' : 'bg-[#F4860A] hover:bg-[#F4860A]/90'} 
                backdrop-blur-md shadow-lg hover:shadow-xl border ${theme.text}`}
            >
              {isConnected ? 'Connected' : 'Connect Wallet'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`max-w-4xl mx-auto ${theme.container} rounded-2xl shadow-2xl p-6 border ${theme.border}`}>
          <div className="text-center mb-8">
            <img 
              src={accessTicketImg} 
              alt="Eternal Pass Ticket" 
              className="w-32 h-32 mx-auto mb-4"
            />
            <h1 className={`text-4xl font-bold mb-4 ${theme.text}`}>Rune Realm Eternal Pass</h1>
            <p className={`text-xl ${theme.text} opacity-90 max-w-2xl mx-auto`}>
              Begin your journey as a legendary monster hunter in Rune Realm. Customize your character's appearance,
              join elite factions, and earn exclusive rewards in this epic adventure.
            </p>
            <p className={`mt-4 text-lg ${theme.text} opacity-80 max-w-2xl mx-auto`}>
              Your character's appearance can be customized at any time, making your presence in Rune Realm truly unique.
            </p>
          </div>

          {/* Purchase Section */}
          <div className="mt-8">
            {isConnected ? (
              <>
                <PurchaseAccess 
                  wallet={window.arweaveWallet} 
                  onPurchaseComplete={() => setIsUnlocked(true)}
                  darkMode={darkMode}
                  isUnlocked={isUnlocked}
                />
                {isUnlocked && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <Link
                      to="/customize"
                      className={`px-6 py-3 rounded-xl text-lg font-medium transition-all duration-300 transform hover:scale-105
                        ${theme.buttonBg} ${theme.buttonHover} ${theme.text} 
                        backdrop-blur-md shadow-lg hover:shadow-xl border ${theme.border}`}
                    >
                      Set Up Your Sprite
                    </Link>
                    <Link
                      to="/factions"
                      className={`px-6 py-3 rounded-xl text-lg font-medium transition-all duration-300 transform hover:scale-105
                        ${theme.buttonBg} ${theme.buttonHover} ${theme.text} 
                        backdrop-blur-md shadow-lg hover:shadow-xl border ${theme.border}`}
                    >
                      Choose Your Faction
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className={`text-center ${theme.text} opacity-80`}>
                Please connect your wallet to continue
              </div>
            )}
          </div>

          {/* Benefits Section */}
          <div className="mt-16">
            <h2 className={`text-2xl font-bold mb-6 text-center ${theme.text}`}>Premium Benefits</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <BenefitCard
                title="Monster Hunting"
                description="Join elite monster hunting expeditions"
                icon="🗡️"
                theme={theme}
              />
              <BenefitCard
                title="Join Factions"
                description="Align with powerful factions and unlock their secrets"
                icon="⚔️"
                theme={theme}
              />
              <BenefitCard
                title="Daily Rewards"
                description="Complete daily tasks for exclusive rewards"
                icon="🎁"
                theme={theme}
              />
              <BenefitCard
                title="Character Customization"
                description="Create and modify your unique character anytime"
                icon="🎨"
                theme={theme}
              />
              <BenefitCard
                title="Exclusive Access"
                description="Get early access to new features and events"
                icon="🔑"
                theme={theme}
              />
              <BenefitCard
                title="Premium Items"
                description="Access to premium items and equipment"
                icon="💎"
                theme={theme}
              />
              <BenefitCard
                title="Community Events"
                description="Participate in exclusive community events"
                icon="🎉"
                theme={theme}
              />
              <BenefitCard
                title="Future Updates"
                description="Access to all future expansions"
                icon="🚀"
                theme={theme}
              />
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className={`text-2xl font-bold mb-6 text-center ${theme.text}`}>FAQ</h2>
            <div className="space-y-4">
              <FAQItem
                question="What is the Eternal Pass?"
                answer="The Eternal Pass is your premium access to Rune Realm, unlocking exclusive features like faction membership, daily rewards, character customization, and much more. It's a one-time purchase for lifetime access."
                theme={theme}
              />
              <FAQItem
                question="Can I change my character's appearance later?"
                answer="Yes! You can customize your character's appearance at any time. Your Eternal Pass gives you unlimited access to the character customization feature."
                theme={theme}
              />
              <FAQItem
                question="What are factions?"
                answer="Factions are elite monster hunting groups in Rune Realm. Each has unique benefits, quests, and rewards. With the Eternal Pass, you can join these exclusive factions and participate in their activities."
                theme={theme}
              />
              <FAQItem
                question="How do I get started?"
                answer="Simply connect your Arweave wallet and purchase the Eternal Pass. Once purchased, you'll have immediate access to all premium features including character customization and faction membership."
                theme={theme}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface BenefitCardProps {
  title: string;
  description: string;
  icon: string;
  theme: any;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ title, description, icon, theme }) => (
  <div className={`p-4 rounded-xl bg-[#814E33]/20 border border-[#F4860A]/30 hover:bg-[#814E33]/30 transition-all duration-300`}>
    <div className="flex flex-col items-center text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className={`text-sm font-bold mb-1 ${theme.text}`}>{title}</h3>
      <p className={`text-xs ${theme.text} opacity-80`}>{description}</p>
    </div>
  </div>
);

interface FAQItemProps {
  question: string;
  answer: string;
  theme: any;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, theme }) => (
  <div className={`p-4 rounded-xl bg-[#814E33]/20 border border-[#F4860A]/30`}>
    <h3 className={`text-lg font-bold mb-2 ${theme.text}`}>{question}</h3>
    <p className={`${theme.text} opacity-80`}>{answer}</p>
  </div>
);

export default PurchaseInfo;
