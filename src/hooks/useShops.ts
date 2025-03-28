import { useState, useEffect, useCallback } from "react";
import { customAlphabet } from "nanoid";

interface Comment {
    text: string;
    timestamp: Date;
}

interface Channel {
    id: string;
    name: string;
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
        console.log("Deleting shop with ID:", shopId);
        console.log("Current shops before deletion:", shops); // Add this line
        setShops((prevShops) => {
            const newShops = prevShops.filter((shop) => {
                console.log("Comparing:", shop.id, "with", shopId);
                return shop.id !== shopId;
            });
            console.log("Shops after deletion:", newShops); // Add this line
            return newShops;
        });
    }, [shops]); // Add shops to dependencies

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
            // Type guard to check if err is an instance of Error
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

    const addComment = useCallback((shopId: string, comment: string) => {
        setShops((prevShops) =>
            prevShops.map((shop) =>
                shop.id === shopId
                    ? {
                        ...shop,
                        comments: [
                            ...(shop.comments || []),
                            { text: comment, timestamp: new Date() },
                        ],
                    }
                    : shop
            )
        );
    }, []);

    const deleteComment = useCallback((shopId: string, commentIndex: number) => {
        setShops((prevShops) =>
            prevShops.map((shop) =>
                shop.id === shopId
                    ? {
                        ...shop,
                        comments: shop.comments?.filter((_, index) => index !== commentIndex),
                    }
                    : shop
            )
        );
    }, []);

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

    const updateMappedChannels = useCallback((shopId: string, channelId: string) => {
        setShops((prevShops) =>
            prevShops.map((shop) => {
                if (shop.id === shopId) {
                    const mappedChannels = shop.mappedChannels ? [...shop.mappedChannels, channelId] : [channelId];
                    return { ...shop, mappedChannels: [...new Set(mappedChannels)] }; // Ensure unique channels
                }
                return shop;
            })
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

    const getShopById = useCallback((shopId: string): Shop | undefined => {
        return shops.find((shop) => shop.id === shopId);
    }, [shops]);

    return {
        shops,
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
    };
};

export default useShops;