"use client";
import {createContext, useContext, useState} from 'react';


// Define a type for your context state
type ImageContextType = {
    variationId: string | null;
    setVariationId: (id: string | null) => void;
};

// Create a default context value
const defaultImageContext: ImageContextType = {
    variationId: null,
    setVariationId: () => {},
};

// Create the context with the default value
const ImageContext = createContext<ImageContextType>(defaultImageContext);

// Export the hook for using the context
export function useImage() {
    return useContext(ImageContext);
}

export function ImageProvider({ children }:{children : React.ReactNode}) {
    const [variationId, setVariationId] = useState<string | null>(null);

    const value = {
        variationId,
        setVariationId,
    };

    return (
        <ImageContext.Provider value={value}>
            {children}
        </ImageContext.Provider>
    );
}
