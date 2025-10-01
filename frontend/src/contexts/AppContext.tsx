import React, { createContext, useContext, ReactNode } from 'react';
import { App, message } from 'antd';

interface AppContextType {
  message: typeof message;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const appContextValue: AppContextType = {
    message: messageApi,
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <App>
        {contextHolder}
        {children}
      </App>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};