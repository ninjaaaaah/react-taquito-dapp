import { useContext, useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import TransactionDetails from '../components/TransactionDetails';
import AccountContext from '../contexts/account-data';
import { getParties, getTransaction } from '../utils/storage';

const Transaction = () => {
  const { transactionId } = useParams();
  const account = useContext(AccountContext);
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState({});

  const mounted = useRef(false);

  useEffect(() => {
    if (!account.authenticated) {
      navigate('/');
    }
    mounted.current = true;
    console.log(mounted.current);
  }, [account, navigate]);

  const fetchCommission = useCallback(async () => {
    const transaction = await getTransaction(transactionId);
    const parties = await getParties(transactionId);
    transaction.id = transactionId;
    transaction.owner = parties.owner;
    transaction.counterparty = parties.counterparty;
    setTransaction(transaction);
  }, [transactionId]);

  useEffect(() => {
    fetchCommission();
  }, [fetchCommission]);

  return (
    mounted.current && (
      <div className="flex flex-col min-h-screen min-w-screen bg-primary/10">
        <Header />
        <div className="flex flex-col w-full max-w-screen-xl gap-4 px-4 mx-auto sm:px-6 lg:px-8">
          <TransactionDetails
            transaction={transaction}
            fetchCommission={fetchCommission}
          />
        </div>
      </div>
    )
  );
};

export default Transaction;
