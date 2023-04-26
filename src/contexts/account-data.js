import { useState, createContext } from 'react';
import { disconnectWallet, getAccountAddress } from '../utils/wallet';

const AccountContext = createContext({
  address: '',
  type: '',
  authenticated: false,
  transaction: {},
  setAddress: async () => {},
  setType: (isAdmin) => {},
  setAuthenticated: (authenticated) => {},
  fetchAccountData: async (inAdminPage, transactionId, contractStorage) => {},
  resetAccountData: async () => {},
});

export const AccountDataContextProvider = (props) => {
  const [address, setAddress] = useState(localStorage.getItem('address'));
  const [type, setType] = useState(localStorage.getItem('type'));
  const [authenticated, setAuthenticated] = useState(
    localStorage.getItem('authenticated') === 'true' ? true : false
  );

  const setAddressHandler = async () => {
    const address = await getAccountAddress();
    setAddress(address);
  };

  const setTypeHandler = (isAdmin, contractStorage) => {
    if (isAdmin) {
      setType('admin');
      localStorage.setItem('type', 'admin');
      return;
    }

    setType('user');
    localStorage.setItem('type', 'user');
  };

  const fetchAccountDataHandler = async (inAdmin, contractStorage) => {
    const address = await getAccountAddress();
    setAddress(address);
    localStorage.setItem('address', address);

    const admin = contractStorage.master;

    console.log(admin);

    if (inAdmin && address === admin) {
      console.log('admin');
      setType('admin');
      localStorage.setItem('type', 'admin');
      setAuthenticated(true);
      localStorage.setItem('authenticated', true);
      return true;
    } else if (inAdmin && address !== admin) {
      setType('user');
      localStorage.setItem('type', 'user');
      setAuthenticated(true);
      localStorage.setItem('authenticated', true);
      return true;
    }

    return false;
  };

  const resetAccountDataHandler = async () => {
    await disconnectWallet();
    setAddress('');
    setType('');
    setAuthenticated(false);
    localStorage.setItem('address', '');
    localStorage.setItem('type', '');
    localStorage.setItem('authenticated', false);
  };

  const setAuthenticatedHandler = (authenticated) => {
    setAuthenticated(authenticated);
  };

  const context = {
    address: address,
    type: type,
    authenticated: authenticated,
    setAddress: setAddressHandler,
    setType: setTypeHandler,
    setAuthenticated: setAuthenticatedHandler,
    fetchAccountData: fetchAccountDataHandler,
    resetAccountData: resetAccountDataHandler,
  };

  return (
    <AccountContext.Provider value={context}>
      {props.children}
    </AccountContext.Provider>
  );
};

export default AccountContext;
