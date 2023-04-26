import { useState, createContext } from 'react';
import { getStorage } from '../utils/storage';

const ContractContext = createContext({
  storage: {},
  fetchStorage: async () => {},
});

export const ContractDataContext = (props) => {
  const [storage, setStorage] = useState(localStorage.getItem('storage'));

  const fetchStorage = async () => {
    const storage = await getStorage();
    setStorage(storage);
    localStorage.setItem('storage', storage);
  };

  const context = {
    storage: storage,
    fetchStorage: fetchStorage,
  };

  return (
    <ContractContext.Provider value={context}>
      {props.children}
    </ContractContext.Provider>
  );
};

export default ContractContext;
