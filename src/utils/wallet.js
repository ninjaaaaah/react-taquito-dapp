// Setup a Beacon Wallet instance
import { BeaconWallet } from '@taquito/beacon-wallet';
import { toast } from 'react-toastify';

export const contractAddress = 'KT1H2MCCacvQxweEbb5eonttpc83d7ru9Z3J';
export const network = 'ghostnet';

export const wallet = new BeaconWallet({
  name: 'Tezos Taquito Integration with Escrow Contract',
  preferredNetwork: network,
  eventHandlers: {
    PERMISSION_REQUEST_ERROR: {
      handler: async (data) => {
        toast.error(data);
        console.log('PERMISSION_REQUEST_ERROR', data);
      },
    },
  },
});

export const connectWallet = async () => {
  await wallet.requestPermissions({ network: { type: network } });
};

export const disconnectWallet = async () => {
  await wallet.clearActiveAccount();
};

export const getAccountAddress = async () => {
  const activeAccount = await wallet.client.getActiveAccount();

  if (activeAccount) {
    return activeAccount.address;
  }

  return 'none';
};
