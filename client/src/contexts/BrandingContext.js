import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';
import resolveAssetUrl from '../utils/resolveAssetUrl';

const DEFAULT_LOGO = '/logo-fricar.png';
const BrandingContext = createContext({ companyName: 'FRICAR', logoUrl: DEFAULT_LOGO });

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState({ companyName: 'FRICAR', logoUrl: DEFAULT_LOGO });

  const resolveLogoUrl = resolveAssetUrl;

  useEffect(() => {
    let mounted = true;
    api.get('/api/branding/public')
      .then(({ data }) => {
        if (!mounted) return;
        setBranding({
          companyName: data?.companyName || 'FRICAR',
          logoUrl: resolveLogoUrl(data?.logoUrl || DEFAULT_LOGO)
        });
      })
      .catch(() => {
        // silent fallback
      });
    return () => { mounted = false; };
  }, []);

  return <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
