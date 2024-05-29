"use client";
import {createContext, useContext, useState} from 'react';


// Define a type for your context state
type ImageContextType = {
    variationId: number | string | null | undefined;
    activeVariation: any;
    setVariationId: (id: string | null | undefined) => void;
};

// Create a default context value
const defaultImageContext: ImageContextType = {
    variationId: null,
    activeVariation: null,
    setVariationId: () => {},
};

// Create the context with the default value
const ImageContext = createContext<ImageContextType>(defaultImageContext);

// Export the hook for using the context
export function useImage() {
    return useContext(ImageContext);
}

export function ImageProvider({ children }:{children : React.ReactNode}) {
    const [variationId, setVariationId] = useState<string  | undefined | null>(null);
    const [activeVariation, setActiveVariation] = useState<string | null>(null);

    const value = {
        variationId,
        setVariationId,
        activeVariation,
        setActiveVariation
    };

    return (
        <ImageContext.Provider value={value}>
            {children}
        </ImageContext.Provider>
    );
}
