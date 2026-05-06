import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';
import resolveAssetUrl from '../utils/resolveAssetUrl';

const BrandingContext = createContext({ companyName: 'FRICAR', logoUrl: '' });

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState({ companyName: 'FRICAR', logoUrl: '' });

  const resolveLogoUrl = resolveAssetUrl;

  useEffect(() => {
    let mounted = true;
    api.get('/api/branding/public')
      .then(({ data }) => {
        if (!mounted) return;
        setBranding({
          companyName: data?.companyName || 'FRICAR',
          logoUrl: resolveLogoUrl(data?.logoUrl || '')
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
