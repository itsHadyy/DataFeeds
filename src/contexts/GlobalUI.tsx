import React, { createContext, useContext, useState } from 'react';

interface GlobalUIContextType {
    showSettings: boolean;
    setShowSettings: (show: boolean) => void;
    showComments: boolean;
    setShowComments: (show: boolean) => void;
    activeCommentField: string | null; 
    setActiveCommentField: (field: string | null) => void; 
}

const GlobalUIContext = createContext<GlobalUIContextType | undefined>(undefined);

export const GlobalUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [showSettings, setShowSettings] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [activeCommentField, setActiveCommentField] = useState<string | null>(null); 

    return (
        <GlobalUIContext.Provider
            value={{
                showSettings,
                setShowSettings,
                showComments,
                setShowComments,
                activeCommentField,
                setActiveCommentField
            }}
        >
            {children}
        </GlobalUIContext.Provider>
    );
};

export const useGlobalUI = () => {
    const context = useContext(GlobalUIContext);
    if (!context) {
        throw new Error('useGlobalUI must be used within a GlobalUIProvider');
    }
    return context;
};