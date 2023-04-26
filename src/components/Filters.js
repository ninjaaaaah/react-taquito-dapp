import { Popover, Transition } from '@headlessui/react';
import { ChevronDownIcon, FunnelIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';

export default function Filters({ columns, changeColumnVisibility }) {
  return (
    <Popover className="relative border border-gray-200 rounded-full">
      {({ open }) => (
        <>
          <Popover.Button className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 ">
            <FunnelIcon />
            <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 z-10 max-w-sm px-4 mt-3 w-fit sm:px-0 lg:max-w-3xl">
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="relative grid gap-2 p-4 bg-white">
                  <div className="flex items-center w-full gap-2 pb-2 border-b border-gray-200">
                    <input
                      type="checkbox"
                      id="SelectAll"
                      className="w-5 h-5 border-gray-300 rounded"
                      defaultChecked={Object.keys(columns).every(
                        (item) => columns[item].shown
                      )}
                      onChange={(e) =>
                        changeColumnVisibility('all', e.target.checked)
                      }
                    />
                    <label
                      htmlFor={'SelectAll'}
                      className="block text-xs font-medium text-gray-700"
                    >
                      Toggle All
                    </label>
                  </div>
                  {Object.keys(columns).map((item) => (
                    <div className="flex items-center gap-2 w-max">
                      <input
                        type="checkbox"
                        id="SelectAll"
                        checked={columns[item].shown}
                        className="w-5 h-5 border-gray-300 rounded"
                        onChange={() => changeColumnVisibility(item)}
                      />
                      <label
                        htmlFor={columns[item].accessor}
                        className="block text-xs font-medium text-gray-700"
                      >
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
