import React, { Fragment, useContext, useState } from 'react';

import { CheckIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { formatTezos } from '../utils/tezos';
import { getAccountAddress } from '../utils/wallet';
import {
  acceptCommision,
  approveCommission,
  cancelCounterparty,
  cancelOwner,
  claimOwner,
  depositCounterparty,
  depositOwner,
} from '../utils/operations';
import AccountContext from '../contexts/account-data';
import Dialog from '../components/ClaimCounterpartyDialog';
import { Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const status = {
  '-1': {
    name: 'Withdrawn',
    style: 'bg-red-100 text-red-800',
  },
  0: {
    name: 'Pending',
    style: 'bg-yellow-100 text-yellow-800',
  },
  1: {
    name: 'Active',
    style: 'bg-blue-100 text-blue-800',
  },
  2: {
    name: 'Completed',
    style: 'bg-green-100 text-green-800',
  },
};

const TransactionDetails = ({ transaction, fetchCommission }) => {
  const account = useContext(AccountContext);
  const [loading, setLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleDeposit = async () => {
    try {
      setLoading(true);
      const address = await getAccountAddress();

      switch (address) {
        case transaction.owner:
          await depositOwner(transaction.id, transaction.offer);
          transaction.balanceOwner = transaction.offer;
          break;
        case transaction.counterparty:
          await depositCounterparty(transaction.id, transaction.fee);
          transaction.balanceCounterparty = transaction.fee;
          break;
        default:
          break;
      }
      await fetchCommission();
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      const address = await getAccountAddress();

      switch (address) {
        case transaction.owner:
          await cancelOwner(transaction.id, transaction.offer);
          transaction.balanceOwner = transaction.offer;
          break;
        case transaction.counterparty:
          await cancelCounterparty(transaction.id, transaction.fee);
          transaction.balanceCounterparty = transaction.fee;
          break;
        default:
          break;
      }
      await fetchCommission();
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleClaimOwner = async () => {
    try {
      setLoading(true);
      await claimOwner(transaction.id);
      await fetchCommission();
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleAccept = async () => {
    try {
      setLoading(true);
      await acceptCommision(transaction.id);
      await fetchCommission();
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      await approveCommission(transaction.id);
      await fetchCommission();
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex bg-white shadow-xl w-ful rounded-xl overflow-clip">
      <div className="relative flex items-center w-1/2">
        <img
          src="/transaction.png"
          alt="transaction"
          className="absolute top-0 left-0 object-cover w-full h-full"
        />
        <div className="relative flex flex-col justify-between w-full gap-2 p-8">
          <div className="flex flex-col items-start gap-2">
            <div className="relative">
              <button
                className="relative flex items-center justify-center w-32 h-32 bg-gray-200 rounded-md shadow-sm"
                disabled={transaction.owner}
              >
                {transaction.owner && (
                  <img
                    src={`https://api.dicebear.com/6.x/lorelei/svg?seed=${transaction.owner}`}
                    alt="plus"
                    className="w-28 h-28"
                  />
                )}
              </button>
              <div className="relative text-center">Owner</div>
              <div className="absolute inset-0 flex items-center justify-center w-32 h-32 border rounded-md opacity-75 border-primary animate-ripple" />
              <div className="absolute rounded-md inset-0 flex items-center justify-center w-32 h-32 border border-primary animate-ripple animation-delay-[500ms]" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="relative">
              <button
                className="relative flex items-center justify-center w-32 h-32 bg-gray-200 rounded-md shadow-sm"
                disabled={transaction.counterparty}
              >
                {transaction.counterparty && (
                  <img
                    src={`https://api.dicebear.com/6.x/lorelei/svg?seed=${transaction.counterparty}`}
                    alt="plus"
                    className="w-28 h-28"
                  />
                )}
              </button>
              <div className="relative text-center">Counterparty</div>
              {transaction.counterparty && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center w-32 h-32 border rounded-md opacity-75 border-primary animate-ripple" />
                  <div className="absolute rounded-md inset-0 flex items-center justify-center w-32 h-32 border border-primary animate-ripple animation-delay-[500ms]" />
                </>
              )}
            </div>
          </div>
        </div>
        {account.address === transaction.owner &&
          Number(transaction.status) === 0 &&
          transaction.counterparty !== null && (
            <div className="absolute bottom-8 left-8">
              <button
                disabled={loading}
                className="flex items-center justify-center gap-2 p-4 font-medium text-white rounded-full shadow-xl disabled:bg-primary/60 bg-primary"
                onClick={handleApprove}
              >
                {loading ? (
                  <Spinner />
                ) : (
                  <>
                    <CheckIcon className="w-8 h-8" />
                    Approve
                  </>
                )}
              </button>
            </div>
          )}
      </div>
      <div className="flex flex-col w-1/2 gap-8 p-8">
        <div className="flex justify-between">
          <div>
            <div className="flex flex-col w-full gap-4">
              <div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    status[transaction.status].style
                  }`}
                >
                  {status[transaction.status].name}
                </span>
              </div>
              <h1 className="text-2xl font-bold">{transaction.title}</h1>
            </div>
            <span className="w-10 text-sm text-gray-400 truncate">
              {transaction.id}
            </span>
          </div>
          <Cog6ToothIcon className="w-6 h-6 text-gray-400" />
        </div>
        <div>
          <p>{transaction.description}</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 p-8 border border-gray-400 rounded-xl">
              <h3 className="text-sm">Owner Balance</h3>
              <p className="text-4xl font-bold">
                {formatTezos(transaction.balanceOwner)}
              </p>
            </div>
            <div className="flex flex-col gap-2 p-8 border border-gray-400 rounded-xl">
              <h3 className="text-sm">Counterparty Balance</h3>
              <p className="text-4xl font-bold">
                {formatTezos(transaction.balanceCounterparty)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 p-8 text-white bg-secondary rounded-xl">
              <h3 className="text-sm">Offer</h3>
              <p className="text-2xl font-bold">
                {formatTezos(transaction.offer)}
              </p>
            </div>
            <div className="flex flex-col gap-1 p-8 text-secondary bg-accent rounded-xl">
              <h3 className="text-sm">Fee</h3>
              <p className="text-2xl font-bold">
                {formatTezos(transaction.fee)}
              </p>
            </div>
          </div>
        </div>
        <div>
          {Number(transaction.status) === 0 &&
            transaction.owner === account.address && (
              <div className="flex items-center gap-2">
                <button
                  disabled={loading}
                  onClick={
                    Number(transaction.balanceOwner) === 0
                      ? handleDeposit
                      : handleCancel
                  }
                  className="flex items-center justify-center w-full p-4 text-sm font-bold text-white rounded-md disabled:bg-primary/60 bg-primary"
                >
                  {Number(transaction.balanceOwner) === 0 ? (
                    loading ? (
                      <Spinner />
                    ) : (
                      'Deposit'
                    )
                  ) : loading ? (
                    <Spinner />
                  ) : (
                    'Cancel'
                  )}
                </button>
              </div>
            )}
          {Number(transaction.status) === 0 &&
            transaction.counterparty === account.address && (
              <div className="flex items-center gap-2">
                <button
                  disabled={loading}
                  onClick={
                    Number(transaction.balanceCounterparty) === 0
                      ? handleDeposit
                      : handleCancel
                  }
                  className="flex items-center justify-center w-full p-4 text-sm font-bold text-white rounded-md disabled:bg-primary/60 bg-primary"
                >
                  {Number(transaction.balanceCounterparty) === 0 ? (
                    loading ? (
                      <Spinner />
                    ) : (
                      'Deposit'
                    )
                  ) : loading ? (
                    <Spinner />
                  ) : (
                    'Cancel'
                  )}
                </button>
              </div>
            )}
          {Number(transaction.status) === 1 &&
            (transaction.owner === account.address ||
              transaction.counterparty === account.address) && (
              <div className="flex items-center gap-2">
                <button
                  disabled={loading}
                  onClick={
                    account.address === transaction.owner
                      ? handleClaimOwner
                      : openModal
                  }
                  className="flex items-center justify-center w-full p-4 text-sm font-bold text-white rounded-md disabled:bg-primary/60 bg-primary"
                >
                  {loading ? <Spinner /> : 'Claim'}
                </button>
                <button
                  disabled={loading}
                  className="flex items-center justify-center w-full p-4 text-sm font-bold text-white rounded-md disabled:bg-primary/60 bg-primary"
                >
                  {loading ? <Spinner /> : 'Cancel'}
                </button>
              </div>
            )}
          {Number(transaction.status) === 0 &&
            account.address !== transaction.owner &&
            !transaction.counterparty && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAccept}
                  disabled={loading}
                  className="flex items-center justify-center w-full p-4 text-sm font-bold text-white rounded-md disabled:bg-primary/60 bg-primary"
                >
                  {loading ? <Spinner /> : 'Accept'}
                </button>
              </div>
            )}
          {![0, 1].includes(Number(transaction.status)) && (
            <div className="flex items-center gap-2">
              <button
                className="flex items-center justify-center w-full p-4 text-sm font-bold text-white rounded-md disabled:bg-primary/60 bg-primary/40"
                disabled
              >
                {Number(transaction.status) === 2 ? 'Claimed' : 'Cancelled'}
              </button>
            </div>
          )}
        </div>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          closeModal={closeModal}
          isOpen={isOpen}
          id={transaction.id}
          fetchCommission={fetchCommission}
        />
      </Transition>
    </div>
  );
};

export default TransactionDetails;
