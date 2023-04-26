import {
  useEffect,
  useState,
  Fragment,
  useContext,
  useRef,
  useCallback,
} from 'react';
import {
  getActive,
  getCancelled,
  getCompleted,
  getPending,
  getPendingReverts,
  getTransactionCount,
  getTransactions,
} from './../utils/storage';

// components
import Dialog from './../components/Dialog';

// assets
import { Listbox, Transition } from '@headlessui/react';
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/20/solid';

import AccountContext from '../contexts/account-data';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Filters from '../components/Filters';
import { revertCommissionFunds } from '../utils/operations';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';

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

const Admin = () => {
  const account = useContext(AccountContext);
  const navigate = useNavigate();
  const mounted = useRef(false);
  const [showedColumns, setShowedColumns] = useState(
    JSON.parse(localStorage.getItem('showedColumns')) || {
      ID: {
        accessor: 'key',
        shown: true,
      },
      Title: {
        accessor: 'title',
        shown: false,
      },
      Description: {
        accessor: 'description',
        shown: false,
      },
      'Owner Balance': {
        accessor: 'balanceOwner',
        shown: true,
      },
      'Counterparty Balance': {
        accessor: 'balanceCounterparty',
        shown: true,
      },
      Duration: {
        accessor: 'duration',
        shown: true,
      },
      Epoch: {
        accessor: 'epoch',
        shown: true,
      },
      Fee: {
        accessor: 'fee',
        shown: true,
      },
      Offer: {
        accessor: 'offer',
        shown: true,
      },
      'Owner Withdrawn': {
        accessor: 'ownerHasWithdrawn',
        shown: true,
      },
      'Counterparty Withdrawn': {
        accessor: 'counterpartyHasWithdrawn',
        shown: true,
      },
      Status: {
        accessor: 'status',
        shown: true,
      },
    }
  );

  const [selected, setSelected] = useState(null);
  const [isPendingRevert, setPendingRevert] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [transactionCount, setTransactionCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [table, setTable] = useState(choices[0]);
  const [loading, setLoading] = useState(false);

  const fetchCommissions = useCallback(async () => {
    console.log('Hi!');
    switch (table.name) {
      case 'All Commissions':
        const transactionCount = await getTransactionCount();
        setTransactionCount(transactionCount);
        const newTransactions = await getTransactions(
          page * pageSize,
          pageSize
        );
        setTransactions(newTransactions);
        return;
      case 'Pending':
        const pendingTransactions = await getPending(page * pageSize, pageSize);
        setTransactionCount(pendingTransactions.length);
        setTransactions(pendingTransactions);
        return;
      case 'To Revert':
        const toRevertTransactions = await getPendingReverts(
          page * pageSize,
          pageSize
        );
        setTransactionCount(toRevertTransactions.length);
        setTransactions(toRevertTransactions);
        return;
      case 'Completed':
        const completedTransactions = await getCompleted(
          page * pageSize,
          pageSize
        );
        setTransactionCount(completedTransactions.length);
        setTransactions(completedTransactions);
        return;
      case 'Active':
        const activeTransactions = await getActive(page * pageSize, pageSize);
        setTransactionCount(activeTransactions.length);
        setTransactions(activeTransactions);
        return;
      case 'Cancelled':
        (async () => {
          const cancelledTransactions = await getCancelled(
            page * pageSize,
            pageSize
          );
          setTransactionCount(cancelledTransactions.length);
          setTransactions(cancelledTransactions);
        })();
        return;
      default:
        return;
    }
  }, [table, page, pageSize]);

  useEffect(() => {
    fetchCommissions();
  }, [table, fetchCommissions]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  useEffect(() => {
    console.log(account.authenticated);
    if (!account.authenticated) {
      navigate('/login');
    }
    if (account.type === 'admin') {
      navigate('/admin');
    }

    mounted.current = true;
  }, [account, navigate]);

  const changeColumnVisibility = (column, e) => {
    if (column === 'all') {
      const columns = Object.keys(showedColumns);
      const newShowedColumns = {};
      columns.forEach((column) => {
        newShowedColumns[column] = {
          ...showedColumns[column],
          shown: e,
        };
      });
      setShowedColumns(newShowedColumns);
      localStorage.setItem('showedColumns', JSON.stringify(newShowedColumns));
      return;
    }
    setShowedColumns({
      ...showedColumns,
      [column]: {
        ...showedColumns[column],
        shown: !showedColumns[column].shown,
      },
    });
    localStorage.setItem('showedColumns', JSON.stringify(showedColumns));
    console.log(showedColumns);
  };

  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  const navigateTransactionPage = async (page) => {
    setPage(page);
    fetchCommissions();
  };

  const changePageSize = async (newPageSize) => {
    if (newPageSize < pageSize) {
      setTransactions(transactions.slice(0, newPageSize));
      setPageSize(newPageSize);
      return;
    }

    fetchCommissions();
  };

  const handleApproveRevert = async () => {
    setLoading(true);
    try {
      await revertCommissionFunds(selected);
      fetchCommissions();
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleSelect = (transaction) => {
    if (selected === transaction.key) {
      setSelected(null);
      setPendingRevert(false);
      return;
    }
    setSelected(transaction.key);
    setPendingRevert(
      transaction.value.ownerHasWithdrawn &&
        transaction.value.counterpartyHasWithdrawn &&
        transaction.value.status >= 0
    );
  };

  const gotoTransactionPage = () => {
    navigate(`/transaction/${selected}`);
  };

  return (
    mounted.current && (
      <div className="flex flex-col min-h-screen min-w-screen bg-primary/10">
        <Header />
        <div className="flex flex-col w-full max-w-screen-xl gap-4 px-4 py-8 mx-auto bg-white rounded-md shadow-lg sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <TransactionChoices selected={table} setSelected={setTable} />
            <div className="flex gap-4 h-fit">
              {selected && isPendingRevert && (
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md bg-secondary disabled:bg-secondary/60 hover:bg-secondary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  onClick={handleApproveRevert}
                  disabled={loading}
                >
                  {loading ? <Spinner className="w-5 h-5" /> : 'Approve'}
                </button>
              )}
              {selected && (
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md bg-secondary hover:bg-secondary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  onClick={() => {
                    gotoTransactionPage();
                  }}
                >
                  View
                </button>
              )}
              <div className="relative">
                <label className="sr-only" htmlFor="search">
                  {' '}
                  Search{' '}
                </label>

                <input
                  className="w-full h-10 text-sm bg-white border border-gray-200 rounded-full pe-10 ps-4 sm:w-56"
                  id="search"
                  type="search"
                  placeholder="Search transaction..."
                />

                <button
                  type="button"
                  className="absolute p-2 text-gray-600 transition -translate-y-1/2 rounded-full end-1 top-1/2 bg-gray-50 hover:text-gray-700"
                >
                  <span className="sr-only">Search</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
              <Filters
                columns={showedColumns}
                changeColumnVisibility={changeColumnVisibility}
              />
            </div>
          </div>
          <div className="flex flex-col w-full gap-4">
            <div className="pb-2 overflow-x-auto">
              <table className="min-w-full text-sm divide-y-2 divide-gray-200">
                <thead className="ltr:text-left rtl:text-right">
                  <tr>
                    {Object.keys(showedColumns).map(
                      (col) =>
                        showedColumns[col].shown && (
                          <th
                            key={col}
                            scope="col"
                            className="px-4 py-2 text-xs tracking-wider text-center text-gray-900 uppercase bg-white font-bolder"
                          >
                            {col}
                          </th>
                        )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.key}
                      onClick={() => handleSelect(transaction)}
                      className={`cursor-pointer ${
                        selected === transaction.key && 'bg-gray-100'
                      }`}
                    >
                      {Object.keys(showedColumns).map((col) => {
                        switch (showedColumns[col].accessor) {
                          case 'key':
                            return (
                              showedColumns[col].shown && (
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {transaction[showedColumns[col].accessor]}
                                </td>
                              )
                            );
                          case 'ownerHasWithdrawn':
                            return (
                              showedColumns[col].shown && (
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <div className="flex justify-center">
                                    <input
                                      type="checkbox"
                                      className="w-5 h-5 border-gray-300 rounded"
                                      checked={
                                        transaction.value[
                                          showedColumns[col].accessor
                                        ]
                                      }
                                      disabled
                                    />
                                  </div>
                                </td>
                              )
                            );
                          case 'counterpartyHasWithdrawn':
                            return (
                              showedColumns[col].shown && (
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <div className="flex justify-center">
                                    <input
                                      type="checkbox"
                                      className="w-5 h-5 border-gray-300 rounded"
                                      checked={
                                        transaction.value[
                                          showedColumns[col].accessor
                                        ]
                                      }
                                      disabled
                                    />
                                  </div>
                                </td>
                              )
                            );
                          case 'epoch':
                            return (
                              showedColumns[col].shown && (
                                <td className="px-4 py-2 text-center whitespace-nowrap">
                                  {Intl.DateTimeFormat('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                  }).format(
                                    new Date(
                                      transaction.value[
                                        showedColumns[col].accessor
                                      ]
                                    )
                                  )}
                                </td>
                              )
                            );
                          case 'status':
                            return (
                              showedColumns[col].shown && (
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                      status[
                                        transaction.value[
                                          showedColumns[col].accessor
                                        ]
                                      ].style
                                    }`}
                                  >
                                    {
                                      status[
                                        transaction.value[
                                          showedColumns[col].accessor
                                        ]
                                      ].name
                                    }
                                  </span>
                                </td>
                              )
                            );
                          default:
                            return (
                              showedColumns[col].shown && (
                                <td className="px-4 py-2 text-center whitespace-nowrap max-w-[10rem] truncate">
                                  {
                                    transaction.value[
                                      showedColumns[col].accessor
                                    ]
                                  }
                                </td>
                              )
                            );
                        }
                      })}
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td
                        className="px-4 py-2 text-center whitespace-nowrap"
                        colSpan={Object.keys(showedColumns).length + 1}
                      >
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing
                  <input
                    type="number"
                    className="w-12 h-8 px-2 py-2 mx-2 text-sm text-gray-700 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                    value={Math.min(pageSize, transactionCount)}
                    min={1}
                    onChange={(e) => changePageSize(e.target.value)}
                  />
                  of
                  <span className="font-medium"> {transactionCount} </span>
                  results
                </p>
              </div>
              <div className="hidden ml-4 lg:flex">
                <nav
                  className="inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    disabled={page === 0}
                    onClick={() => navigateTransactionPage(page - 1)}
                    className="inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
                  </button>
                  {page !== 0 && (
                    <button
                      onClick={() => navigateTransactionPage(page - 1)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 cursor-pointer hover:bg-gray-50"
                    >
                      {page}
                    </button>
                  )}
                  <button
                    aria-current="page"
                    className="inline-flex items-center px-4 py-2 text-sm font-bold text-white border cursor-default border-primary bg-primary "
                    disabled
                  >
                    {page + 1}
                  </button>
                  {page < transactionCount / pageSize - 1 && (
                    <button
                      onClick={() => navigateTransactionPage(page + 1)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 cursor-pointer hover:bg-gray-50"
                    >
                      {page + 2}
                    </button>
                  )}
                  <button
                    disabled={page >= transactionCount / pageSize - 1}
                    onClick={() => navigateTransactionPage(page + 1)}
                    className="inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
        <Transition appear show={isOpen} as={Fragment}>
          <Dialog closeModal={closeModal} isOpen={isOpen} />
        </Transition>
      </div>
    )
  );
};

const choices = [
  { name: 'All Commissions' },
  { name: 'Cancelled' },
  { name: 'To Revert' },
  { name: 'Pending' },
  { name: 'Completed' },
  { name: 'Active' },
];

const TransactionChoices = ({ selected, setSelected }) => {
  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative mt-1">
        <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left cursor-default focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            <span className="block truncate">{selected.name}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronUpDownIcon
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </h2>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg w-max max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {choices.map((choice, choiceIdx) => (
              <Listbox.Option
                key={choiceIdx}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-primary text-secondary' : 'text-gray-900'
                  }`
                }
                value={choice}
              >
                <>
                  <span
                    className={`block truncate ${
                      selected.name === choice.name
                        ? 'font-bold'
                        : 'font-normal'
                    }`}
                  >
                    {choice.name}
                  </span>
                  {selected.name === choice.name ? (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-secondary">
                      <CheckIcon className="w-5 h-5" aria-hidden="true" />
                    </span>
                  ) : null}
                </>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default Admin;
