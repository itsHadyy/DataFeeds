import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useShops from '../hooks/useShops'; 

const ShopCreation: React.FC = () => {
    const [shopName, setShopName] = useState('');
    const navigate = useNavigate();
    const { addShop } = useShops(); 

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        addShop(shopName); 
        navigate('/shop-import');
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="shopName">Shop Name:</label>
                <input
                    type="text"
                    id="shopName"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                />
            </div>
            <button type="submit">Add Shop</button>
        </form>
    );
};

export default ShopCreation;