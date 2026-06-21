import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const SiteConfigContext = createContext({});

export function SiteConfigProvider({ children }) {
  const [config, setConfig] = useState({});

  useEffect(() => {
    api.getPublicConfig()
      .then(data => setConfig(data || {}))
      .catch(() => {});
  }, []);

  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export const useSiteConfig = () => useContext(SiteConfigContext);