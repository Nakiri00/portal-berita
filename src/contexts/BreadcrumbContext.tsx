import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'; // 1. Import useCallback

export interface BreadcrumbCrumb {
  label: string;
  path?: string;
}

interface BreadcrumbContextType {
  dynamicCrumbs: BreadcrumbCrumb[];
  setDynamicCrumbs: (crumbs: BreadcrumbCrumb[]) => void;
  clearDynamicCrumbs: () => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export const BreadcrumbProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dynamicCrumbs, setDynamicCrumbs] = useState<BreadcrumbCrumb[]>([]);


  const clearDynamicCrumbs = useCallback(() => {
    setDynamicCrumbs([]);
  }, []); 

  return (
    <BreadcrumbContext.Provider value={{ dynamicCrumbs, setDynamicCrumbs, clearDynamicCrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
};