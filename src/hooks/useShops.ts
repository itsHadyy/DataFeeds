import { useState, useEffect, useCallback } from "react";
import { customAlphabet } from "nanoid";

interface Comment {
    id: string;
    text: string;
    timestamp: string;
    field?: string;
}

interface Channel {
    id: string;
    name: string;
}

interface XMLMapping {
    targetField: string;
    value: string;
    type?: string;
}

interface Shop {
    id: string;
    name: string;
    xmlContent?: string;
    productCount?: number;
    comments?: Comment[];
    abTests?: string[];
    isLocked?: boolean;
    channels?: Channel[];
    mappedChannels?: string[];
    channelMappings?: {
        [channelId: string]: XMLMapping[];
    };
    internalMappings?: XMLMapping[];
}

const STORAGE_KEY = "shops";

const useShops = () => {
    const [shops, setShops] = useState<Shop[]>(() => {
        const storedShops = localStorage.getItem(STORAGE_KEY);
        if (storedShops) {
            try {
                const parsedShops = JSON.parse(storedShops);
                if (Array.isArray(parsedShops)) {
                    return parsedShops;
                }
            } catch (err) {
                console.error("Error parsing stored shops:", err);
            }
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(shops));
    }, [shops]);

    const nanoid = customAlphabet("1234567890abcdef", 5);

    const addShop = useCallback((name: string, xmlContent?: string) => {
        setShops((prevShops) => [
            ...prevShops,
            { id: nanoid(), name, xmlContent, productCount: 0, channels: [] },
        ]);
    }, [nanoid]);

    const deleteShop = useCallback((shopId: string) => {
        setShops((prevShops) => prevShops.filter(shop => shop.id !== shopId));
    }, []);

    const updateShop = useCallback((shopId: string, newName: string) => {
        setShops((prevShops) =>
            prevShops.map((shop) =>
                shop.id === shopId ? { ...shop, name: newName } : shop
            )
        );
    }, []);

    const uploadXMLToShop = useCallback((shopId: string, xmlContent: string) => {
        try {
            const productCount = countProductsInXML(xmlContent);
            setShops((prevShops) =>
                prevShops.map((shop) =>
                    shop.id === shopId ? { ...shop, xmlContent, productCount } : shop
                )
            );
        } catch (err) {
            
            if (err instanceof Error) {
                console.error(err.message);
            } else {
                console.error("An unknown error occurred:", err);
            }
        }
    }, []);

    const countProductsInXML = (xmlContent: string): number => {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
            const items = xmlDoc.getElementsByTagName("item");
            return items.length;
        } catch (err) {
            console.error("Error parsing XML:", err);
            throw new Error("Failed to parse XML. Please ensure the file is valid.");
        }
    };

    const addABTest = useCallback((shopId: string, abTest: string) => {
        setShops((prevShops) =>
            prevShops.map((shop) =>
                shop.id === shopId
                    ? { ...shop, abTests: [...(shop.abTests || []), abTest] }
                    : shop
            )
        );
    }, []);

    const toggleLock = useCallback((shopId: string) => {
        setShops((prevShops) =>
            prevShops.map((shop) =>
                shop.id === shopId ? { ...shop, isLocked: !shop.isLocked } : shop
            )
        );
    }, []);

    const addChannel = useCallback((shopId: string, channelName: string) => {
        setShops((prev) =>
            prev.map((shop) =>
                shop.id === shopId
                    ? {
                        ...shop,
                        channels: [...(shop.channels || []), { id: nanoid(), name: channelName }],
                    }
                    : shop
            )
        );
    }, [nanoid]);

    const deleteChannel = useCallback((shopId: string, channelId: string) => {
        setShops((prevShops) =>
            prevShops.map((shop) =>
                shop.id === shopId
                    ? {
                        ...shop,
                        channels: shop.channels?.filter((channel) => channel.id !== channelId),
                    }
                    : shop
            )
        );
    }, []);

    const removeChannel = useCallback((shopId: string, channelId: string) => {
        setShops(prevShops =>
            prevShops.map(shop => {
                if (shop.id !== shopId) return shop;

                
                const updatedMappedChannels = shop.mappedChannels?.filter(id => id !== channelId) || [];

                
                const updatedChannelMappings = { ...shop.channelMappings };
                if (updatedChannelMappings) {
                    delete updatedChannelMappings[channelId];
                }

                return {
                    ...shop,
                    mappedChannels: updatedMappedChannels,
                    channelMappings: updatedChannelMappings
                };
            })
        );
    }, []);

    const updateMappedChannels = useCallback((shopId: string, channelId: string, shouldAdd: boolean = true) => {
        setShops(prevShops =>
            prevShops.map(shop => {
                if (shop.id !== shopId) return shop;

                if (shouldAdd) {
                    
                    const mappedChannels = shop.mappedChannels ? [...shop.mappedChannels, channelId] : [channelId];
                    return {
                        ...shop,
                        mappedChannels: [...new Set(mappedChannels)]
                    };
                } else {
                    
                    const updatedMappedChannels = shop.mappedChannels?.filter(id => id !== channelId) || [];
                    return {
                        ...shop,
                        mappedChannels: updatedMappedChannels
                    };
                }
            })
        );
    }, []);

    const updateShopMappings = useCallback((shopId: string, channelId: string, mappings: XMLMapping[]) => {
        setShops(prevShops =>
            prevShops.map(shop =>
                shop.id === shopId
                    ? {
                        ...shop,
                        channelMappings: {
                            ...shop.channelMappings,
                            [channelId]: mappings
                        }
                    }
                    : shop
            )
        );
    }, []);

    const updateChannel = useCallback((shopId: string, channelId: string, newName: string) => {
        setShops((prevShops) =>
            prevShops.map((shop) =>
                shop.id === shopId
                    ? {
                        ...shop,
                        channels: shop.channels?.map((channel) =>
                            channel.id === channelId ? { ...channel, name: newName } : channel
                        ),
                    }
                    : shop
            )
        );
    }, []);

    const clearShops = useCallback(() => {
        setShops([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const getShopById = useCallback((shopId: string) => {
        return shops.find(shop => shop.id === shopId);
    }, [shops]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const addComment = useCallback((shopId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => {
        const newComment: Comment = {
            ...comment,
            id: nanoid(),
            timestamp: new Date().toISOString() 
        };

        setShops((prevShops) =>
            prevShops.map((shop) =>
                shop.id === shopId
                    ? {
                        ...shop,
                        comments: [...(shop.comments || []), newComment],
                    }
                    : shop
            )
        );
    }, [nanoid]);

    const deleteComment = useCallback((shopId: string, commentId: string) => {
        setShops((prevShops) =>
            prevShops.map((shop) =>
                shop.id === shopId
                    ? {
                        ...shop,
                        comments: shop.comments?.filter(comment => comment.id !== commentId),
                    }
                    : shop
            )
        );
    }, []);


    useEffect(() => {
        const fetchShops = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/shops');
                const data = await response.json();
                setShops(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load shops');
            } finally {
                setLoading(false);
            }
        };

        fetchShops();
    }, []);

    return {
        shops,
        selectedShop: (shopId: string) => shops.find(shop => shop.id === shopId),
        addShop,
        deleteShop,
        updateShop,
        uploadXMLToShop,
        addComment,
        deleteComment,
        addABTest,
        toggleLock,
        addChannel,
        deleteChannel,
        updateChannel,
        clearShops,
        getShopById,
        updateMappedChannels,
        updateShopMappings,
        loading,
        error,
        removeChannel,

        getInternalMappings: (shopId: string) => {
            const shop = shops.find(s => s.id === shopId);
            return shop?.internalMappings || [];
        },
        updateInternalMappings: (shopId: string, mappings: XMLMapping[]) => {
            setShops(prevShops =>
                prevShops.map(shop =>
                    shop.id === shopId
                        ? {
                            ...shop,
                            internalMappings: mappings
                        }
                        : shop
                )
            );
        }
    };
};

export default useShops;