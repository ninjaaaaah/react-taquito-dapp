import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useState } from 'react';
import { claimCounterparty } from '../utils/operations';
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const CustomDialog = React.forwardRef(
  ({ closeModal, isOpen, id, fetchCommission }, ref) => {
    const [secret, setSecret] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleClaim = async () => {
      setLoading(true);
      try {
        await claimCounterparty(id, secret);
        fetchCommission();
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
              <Dialog.Panel className="flex flex-col w-full max-w-md gap-4 p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h2"
                  className="text-xl font-medium leading-6 text-gray-900"
                >
                  Claim Commission as Counterparty
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500">
                  To claim the commission as counterparty, please enter the
                  secret key obtained from the owner.
                </Dialog.Description>

                <form className="flex flex-col gap-2">
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
                      id="secret"
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Secret"
                    />
                  </div>
                </form>

                <div className="mt-4">
                  <button
                    type="button"
                    disabled={loading}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium border border-transparent rounded-md text-secondary bg-primary/20 hover:bg-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                    onClick={handleClaim}
                  >
                    {loading ? <Spinner /> : 'Claim'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    );
  }
);

export default CustomDialog;
