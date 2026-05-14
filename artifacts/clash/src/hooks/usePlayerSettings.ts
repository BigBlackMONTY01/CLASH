// usePlayerSettings.ts
export function usePlayerSettings() {
  const [settings, setSettings] = useState({
    avatar: 'default',
    accentColor: '#e63946',
    cardBg: 'default',
    soundPack: 'default',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loadSettings = async (token: string) => {
    const res = await fetch('/api/auth/player', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const player = await res.json();
    setSettings({
      avatar: player.avatarId || 'default',
      accentColor: player.accentColor || '#e63946',
      cardBg: player.cardBg || 'default',
      soundPack: player.soundPack || 'default',
    });
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setSettings({
      avatar: 'default',
      accentColor: '#e63946',
      cardBg: 'default',
      soundPack: 'default',
    });
    localStorage.removeItem('token');
  };

  return { settings, isLoggedIn, loadSettings, logout };
}
