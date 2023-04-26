import React from 'react';
import {
  ClockIcon,
  TicketIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { formatTezos } from '../utils/tezos';

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

export default function Commission({ id, transaction }) {
  const navigate = useNavigate();

  return (
    <button
      key={id}
      onClick={() => navigate(`/transaction/${id}`)}
      className="flex flex-col justify-between p-4 text-left rounded-md shadow cursor-pointer hover:shadow-lg"
    >
      <div className="flex flex-col gap-4 ">
        <h1 className="font-bold line-clamp-2">{transaction.title}</h1>
        <p className="text-sm line-clamp-4">{transaction.description}</p>
        <p className="text-sm">{transaction.amount}</p>
      </div>
      <div className="flex justify-between w-full">
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <ClockIcon className="w-4 h-4" />
            <p className="text-sm">{transaction.duration}</p>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <TicketIcon className="w-4 h-4" />
            <p className="text-sm">{formatTezos(transaction.fee)}</p>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <BanknotesIcon className="w-4 h-4" />
            <p className="text-sm">{formatTezos(transaction.offer)}</p>
          </div>
        </div>
        <div>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              status[transaction.status].style
            }`}
          >
            {status[transaction.status].name}
          </span>
        </div>
      </div>
    </button>
  );
}
