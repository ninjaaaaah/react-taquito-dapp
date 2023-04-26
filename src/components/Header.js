import React, { useContext, useEffect, useState } from 'react';
import AccountContext from '../contexts/account-data';
import Dropdown from './Dropdown';
import Logo from './Logo';
import { getAccountBalance } from '../utils/operations';
import { formatTezos } from '../utils/tezos';

const Header = () => {
  const account = useContext(AccountContext);
  const [balance, setBalance] = useState(0);

  const signOut = () => {
    console.log('sign out');
    account.resetAccountData();
  };

  useEffect(() => {
    (async () => {
      const balance = await getAccountBalance(account.address);
      setBalance(balance);
    })();
  }, [account]);

  return (
    <header aria-label="Page Header">
      <div className="max-w-screen-xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center justify-end gap-4">
            <div className="flex items-center gap-4">
              <div className="px-4 py-1 text-xs font-medium rounded-full bg-secondary/40 text-content">
                {`Bal: `}
                <span className="text-base font-bold">
                  {formatTezos(balance, 'standard')}
                </span>
              </div>
            </div>

            <span
              aria-hidden="true"
              className="block w-px h-6 rounded-full bg-secondary"
            />

            <Dropdown action={signOut}>
              <div className="block shrink-0">
                <span className="sr-only">Profile</span>
                <img
                  alt="Man"
                  src={`https://api.dicebear.com/6.x/lorelei/svg?seed=${account.address}`}
                  className="object-cover w-10 h-10 rounded-full bg-secondary/40"
                />
              </div>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
