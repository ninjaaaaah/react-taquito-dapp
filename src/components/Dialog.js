import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useState } from 'react';
import { postCommission } from '../utils/operations';
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const CustomDialog = React.forwardRef(({ closeModal, isOpen }, ref) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [offer, setOffer] = useState(null);
  const [fee, setFee] = useState(null);
  const [duration, setDuration] = useState(null);
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);

  const createTransaction = async () => {
    setLoading(true);
    try {
      const transaction = {
        title,
        description,
        offer,
        fee,
        duration,
        secret,
      };

      console.log(transaction);
      await postCommission(transaction);
      closeModal();
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <Dialog
      ref={ref}
      as="div"
      className="relative"
      onClose={closeModal}
      open={isOpen}
    >
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black bg-opacity-25 z-100" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-full p-4 text-center z-100">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="flex flex-col w-full max-w-md gap-8 p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <Dialog.Title
                as="h2"
                className="text-xl font-medium leading-6 text-gray-900"
              >
                New Commission
              </Dialog.Title>
              <form className="flex flex-col gap-2">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Title"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    maxLength={200}
                    class="mt-2 block p-2.5 w-full text-sm text-gray-900 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Write more details about the commission here..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      htmlFor="offer"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Offer
                    </label>
                    <input
                      type="number"
                      name="offer"
                      value={offer}
                      onChange={(e) => setOffer(parseInt(e.target.value))}
                      id="offer"
                      className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="fee"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Fee
                    </label>
                    <input
                      type="number"
                      name="fee"
                      id="fee"
                      value={fee}
                      onChange={(e) => setFee(parseInt(e.target.value))}
                      className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="1"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Duration
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    id="duration"
                    className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label
                    htmlFor="secret"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Secret Key
                  </label>
                  <input
                    type="text"
                    name="secret"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    id="secret"
                    className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Open sesame!"
                  />
                </div>
              </form>

              <div className="mt-4">
                <button
                  type="button"
                  disabled={loading}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium border border-transparent rounded-md text-secondary bg-primary/20 hover:bg-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                  onClick={createTransaction}
                >
                  {loading ? <Spinner className="w-5 h-5" /> : 'Create'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  );
});

export default CustomDialog;
