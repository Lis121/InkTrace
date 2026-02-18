'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type DragonContextType = {
    target: { x: number; y: number } | null; // Normalized 0-1 coordinates
    setTarget: (target: { x: number; y: number } | null) => void;
    isAbsorbed: boolean;
    setIsAbsorbed: (isAbsorbed: boolean) => void;
};

const DragonContext = createContext<DragonContextType | undefined>(undefined);

export const DragonProvider = ({ children }: { children: React.ReactNode }) => {
    const [target, setTarget] = useState<{ x: number; y: number } | null>(null);
    const [isAbsorbed, setIsAbsorbed] = useState(false);

    return (
        <DragonContext.Provider
            value={{
                target,
                setTarget,
                isAbsorbed,
                setIsAbsorbed,
            }}
        >
            {children}
        </DragonContext.Provider>
    );
};

export const useDragon = () => {
    const context = useContext(DragonContext);
    if (!context) {
        throw new Error('useDragon must be used within a DragonProvider');
    }
    return context;
};
