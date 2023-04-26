// utils
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
import Header from '../components/Header';
import AccountContext from '../contexts/account-data';
import { useNavigate } from 'react-router-dom';
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  PlusIcon,
} from '@heroicons/react/20/solid';
import Commission from '../components/Commission';

function Dashboard() {
  const account = useContext(AccountContext);
  const mounted = useRef(false);
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [transactionCount, setTransactionCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [table, setTable] = useState(choices[0]);

  const fetchCommissions = useCallback(async () => {
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
        const pendingRevertTransactions = await getPendingReverts(
          page * pageSize,
          pageSize
        );
        setTransactionCount(pendingRevertTransactions.length);
        setTransactions(pendingRevertTransactions);
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
    if (!account.authenticated) {
      console.log('redirecting');
      navigate('/login');
    }
    if (account.type === 'admin') {
      navigate('/admin');
    }

    mounted.current = true;
  }, [account, navigate]);

  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = async () => {
    setIsOpen(false);
    await fetchCommissions();
  };

  const changePageSize = (e) => {
    setPageSize(e);
    fetchCommissions();
  };

  const navigateTransactionPage = (page) => {
    setPage(page - 1);
    fetchCommissions();
  };

  return (
    mounted.current && (
      <div className="flex flex-col min-h-screen min-w-screen">
        <Header />
        <div className="flex flex-col w-full max-w-screen-xl gap-4 px-4 py-8 mx-auto bg-white sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <TransactionChoices selected={table} setSelected={setTable} />
            <div className="flex gap-4 h-fit">
              <div>
                {/* create a new commission button */}
                <button
                  type="button"
                  onClick={openModal}
                  className="flex items-center gap-1 py-2 pl-3 pr-4 text-sm font-medium text-white rounded-md bg-primary hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                >
                  <PlusIcon className="w-4 h-4 text-white" />
                  New
                </button>
              </div>
              <div className="relative">
                <label className="sr-only" htmlFor="search">
                  {' '}
                  Search{' '}
                </label>

                <input
                  className="w-full h-10 text-sm bg-white border border-gray-200 rounded-full pe-10 ps-4 sm:w-56"
                  id="search"
                  type="search"
                  name="search"
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
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {transactions.map((transaction) => (
              <Commission
                key={transaction.key}
                id={transaction.key}
                transaction={transaction.value}
              />
            ))}
            {transactions.length === 0 && (
              <div className="flex flex-col items-center justify-center w-full h-64 col-span-1 gap-4 text-center rounded-md rounded-xl sm:col-span-2 lg:col-span-3 bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-900">
                  No transactions found
                </h2>
                <p className="text-gray-500">
                  You can create a new transaction by clicking the button above
                </p>
              </div>
            )}
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
                  onClick={() => navigateTransactionPage(page)}
                  className="inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
                </button>
                {page !== 0 && (
                  <button
                    onClick={() => navigateTransactionPage(page)}
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
                    onClick={() => navigateTransactionPage(page + 2)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 cursor-pointer hover:bg-gray-50"
                  >
                    {page + 2}
                  </button>
                )}
                <button
                  disabled={page >= transactionCount / pageSize - 1}
                  onClick={() => navigateTransactionPage(page + 2)}
                  className="px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 inline-flexitems-center rounded-r-md hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
        <Transition appear show={isOpen} as={Fragment}>
          <Dialog closeModal={closeModal} isOpen={isOpen} />
        </Transition>
      </div>
    )
  );
}

export default Dashboard;

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
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-primary text-secondary' : 'text-gray-900'
                  }`
                }
                value={choice}
              >
                <>
                  <span
                    className={`block truncate ${
                      selected.name === choice.name
                        ? 'font-medium text-content'
                        : 'font-light text-content'
                    }`}
                  >
                    {choice.name}
                  </span>
                  {selected.name === choice.name ? (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
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

const choices = [
  { name: 'All Commissions' },
  { name: 'Pending' },
  { name: 'Cancelled' },
  { name: 'To Revert' },
  { name: 'Completed' },
  { name: 'Active' },
];
