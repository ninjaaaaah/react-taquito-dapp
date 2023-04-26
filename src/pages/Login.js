import React, { useContext, useEffect, useState } from 'react';
import Options from '../components/Options';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { connectWallet } from '../utils/wallet';
import { useNavigate } from 'react-router-dom';
import AccountContext from '../contexts/account-data';
import ContractContext from '../contexts/contract-data';
import Logo from '../components/Logo';
import Spinner from '../components/Spinner';

export default function Login() {
  const navigate = useNavigate();
  const contract = useContext(ContractContext);
  const account = useContext(AccountContext);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      contract.fetchStorage();
    })();
    account.resetAccountData();
  }, []);

  // watch for changes in the account data context then navigate to dashboard if the user is authenticated and admin if the user is an admin
  useEffect(() => {
    console.log(account);
    if (account.authenticated) {
      if (account.type === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [account, navigate]);

  const connect = async () => {
    setLoading(true);
    try {
      await connectWallet();
      await account.fetchAccountData(true, contract.storage);
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="relative grid min-h-screen grid-cols-2 min-w-screen">
      <div className="flex flex-col justify-center">
        <div className="flex justify-center p-8">
          <Logo />
        </div>
        <div className="flex flex-col items-center w-full max-w-screen-xl gap-4 px-4 py-8 mx-auto bg-white sm:px-6 lg:px-8">
          <div className="flex flex-col w-full gap-4 px-8 py-10 bg-white border border-gray-200 rounded-xl lg:max-w-xl">
            <h1 className="text-2xl font-medium text-center text-black">
              Connect your wallet to continue
            </h1>
            <form>
              <div className="mt-6">
                <button
                  type="button"
                  className="flex justify-center w-full px-4 py-2 font-medium tracking-wide transition-colors duration-200 transform border-2 rounded-full text-primary border-primary hover:bg-primary hover:text-white focus:outline-none focus:bg-primary"
                  onClick={connect}
                >
                  {loading ? <Spinner /> : '🌮 Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="w-full h-full">
        <img src="/abstract.png" alt="login" className="w-full h-full" />
      </div>
    </div>
  );
}
