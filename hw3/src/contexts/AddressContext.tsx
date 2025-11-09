import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Address {
  id: string;
  name: string;
  address: string;
  phone: string;
  isDefault: boolean;
}

interface AddressContextType {
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getDefaultAddress: () => Address | null;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);

  const addAddress = (addressData: Omit<Address, 'id'>) => {
    const newAddress: Address = {
      ...addressData,
      id: `address-${Date.now()}`,
    };
    
    setAddresses(prev => {
      // 如果設為默認地址，先取消其他地址的默認狀態
      if (newAddress.isDefault) {
        return prev.map(addr => ({ ...addr, isDefault: false })).concat(newAddress);
      }
      return [...prev, newAddress];
    });
  };

  const updateAddress = (id: string, addressData: Partial<Address>) => {
    setAddresses(prev => {
      if (addressData.isDefault) {
        // 如果設為默認地址，先取消其他地址的默認狀態
        return prev.map(addr => 
          addr.id === id 
            ? { ...addr, ...addressData }
            : { ...addr, isDefault: false }
        );
      }
      return prev.map(addr => 
        addr.id === id ? { ...addr, ...addressData } : addr
      );
    });
  };

  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const setDefaultAddress = (id: string) => {
    setAddresses(prev => 
      prev.map(addr => ({ 
        ...addr, 
        isDefault: addr.id === id 
      }))
    );
  };

  const getDefaultAddress = () => {
    return addresses.find(addr => addr.isDefault) || addresses[0] || null;
  };

  const value: AddressContextType = {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
  };

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
};

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};

