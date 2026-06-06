import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext({ accessible: false, setAccessible: () => {} });

export function AccessibilityProvider({ children }) {
  const [accessible, setAccessible] = useState(() => {
    return localStorage.getItem('rotatech-accessible') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('rotatech-accessible', String(accessible));
    if (accessible) {
      document.documentElement.classList.add('accessible-mode');
    } else {
      document.documentElement.classList.remove('accessible-mode');
    }
  }, [accessible]);

  return (
    <AccessibilityContext.Provider value={{ accessible, setAccessible }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);