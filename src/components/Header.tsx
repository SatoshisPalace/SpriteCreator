import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Theme } from '../constants/theme';
import { useWallet } from '../hooks/useWallet';

interface HeaderProps {
  theme: Theme;
  darkMode: boolean;
  showBackButton?: boolean;
  onDarkModeToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({
  theme,
  darkMode,
  showBackButton = true,
  onDarkModeToggle,
}) => {
  const navigate = useNavigate();
  const { wallet, walletStatus, connectWallet } = useWallet();

  const isConnected = walletStatus?.isUnlocked === true;
  const currentSkin = walletStatus?.currentSkin;
  
  return (
    <div className={`flex items-center justify-between px-4 py-4 ${theme.container} border-b ${theme.border} relative flex-shrink-0`}>
      {/* Left side */}
      {showBackButton && (
        <div className="flex items-center">
          <button
            onClick={() => navigate('/')}
            className={`px-6 py-3 ${theme.buttonBg} ${theme.buttonHover} ${theme.text} rounded-xl border ${theme.border} transition-all duration-300 hover:scale-105`}
          >
            ← Back to Main Page
          </button>
        </div>
      )}

      {/* Center logo */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <img 
          src={new URL('../assets/rune-realm-transparent.png', import.meta.url).href} 
          alt="Rune Realm Logo" 
          className="h-20 w-auto" 
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button
          onClick={connectWallet}
          className={`px-6 py-3 ${theme.buttonBg} ${theme.buttonHover} ${theme.text} rounded-xl border ${theme.border} transition-all duration-300 hover:scale-105`}
        >
          {isConnected ? (
            <span>Connected {currentSkin ? '(Has Skin)' : ''}</span>
          ) : (
            'Connect Wallet'
          )}
        </button>
        <button
          onClick={onDarkModeToggle}
          className={`px-4 py-3 ${theme.buttonBg} ${theme.buttonHover} ${theme.text} rounded-xl border ${theme.border} transition-all duration-300 hover:scale-105`}
        >
          <span className="text-lg">{darkMode ? '☀️' : '🌙'}</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
