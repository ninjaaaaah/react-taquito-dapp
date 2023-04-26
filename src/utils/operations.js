import { toast } from 'react-toastify';
import { tezos } from './tezos.js';
import { contractAddress } from './wallet.js';
import { v4 as uuidv4 } from 'uuid';

const gasBuffer = 500;
const MINIMAL_FEE_PER_GAS_MUTEZ = 0.1;
const increasedFee = (gasBuffer, opSize) => {
  return gasBuffer * MINIMAL_FEE_PER_GAS_MUTEZ + opSize;
};

export const getAccountBalance = async (address) => {
  const account = await tezos.tz.getBalance(address);
  return account.toNumber() / 1000000;
};

export const acceptCommision = async (transactionId) => {
  const contract = await tezos.wallet.at(contractAddress);
  const opEntry = contract.methods
    .acceptCommission(transactionId)
    .toTransferParams({});

  const estimate = await tezos.estimate.transfer(opEntry);

  const op = await contract.methods.acceptCommission(transactionId).send({
    fee:
      estimate.suggestedFeeMutez +
      increasedFee(gasBuffer, Number(estimate.opSize)),
    gasLimit: estimate.gasLimit + gasBuffer,
    storageLimit: estimate.storageLimit,
  });
  await new Promise((resolve, reject) => {
    const evts = [];

    op.confirmationObservable(1).subscribe(
      (event) => {
        const entry = {
          level: event.block.header.level,
          currentConfirmation: event.currentConfirmation,
        };
        evts.push(entry);
      },
      () => reject(null),
      () => {
        toast.success('Transaction posted');
        resolve(evts);
      }
    );
  });
};

export const approveCommission = async (transactionId) => {
  const contract = await tezos.wallet.at(contractAddress);
  const opEntry = contract.methods
    .approveCommission(transactionId)
    .toTransferParams({});
  const estimate = await tezos.estimate.transfer(opEntry);

  const op = await contract.methods.approveCommission(transactionId).send({
    fee:
      estimate.suggestedFeeMutez +
      increasedFee(gasBuffer, Number(estimate.opSize)),
    gasLimit: estimate.gasLimit + gasBuffer,
    storageLimit: estimate.storageLimit,
  });
  await new Promise((resolve, reject) => {
    const evts = [];

    op.confirmationObservable(1).subscribe(
      (event) => {
        const entry = {
          level: event.block.header.level,
          currentConfirmation: event.currentConfirmation,
        };
        evts.push(entry);
      },
      () => reject(null),
      () => {
        toast.success('Transaction posted');
        resolve(evts);
      }
    );
  });
};

export const depositOwner = async (transactionId, amount) => {
  const contract = await tezos.wallet.at(contractAddress);
  const opEntry = contract.methods
    .depositOwner(transactionId)
    .toTransferParams({ amount: amount, mutez: true });

  const estimate = await tezos.estimate.transfer(opEntry);

  const op = await contract.methods.depositOwner(transactionId).send({
    fee:
      estimate.suggestedFeeMutez +
      increasedFee(gasBuffer, Number(estimate.opSize)),
    gasLimit: estimate.gasLimit + gasBuffer,
    storageLimit: estimate.storageLimit,
    amount: amount,
    mutez: true,
  });
  await new Promise((resolve, reject) => {
    const evts = [];

    op.confirmationObservable(1).subscribe(
      (event) => {
        const entry = {
          level: event.block.header.level,
          currentConfirmation: event.currentConfirmation,
        };
        evts.push(entry);
      },
      () => reject(null),
      () => {
        toast.success('Transaction posted');
        resolve(evts);
      }
    );
  });
};

export const depositCounterparty = async (transactionId, amount) => {
  const contract = await tezos.wallet.at(contractAddress);
  const opEntry = contract.methods
    .depositCounterparty(transactionId)
    .toTransferParams({ amount: amount, mutez: true });

  const estimate = await tezos.estimate.transfer(opEntry);

  const op = await contract.methods.depositCounterparty(transactionId).send({
    fee:
      estimate.suggestedFeeMutez +
      increasedFee(gasBuffer, Number(estimate.opSize)),
    gasLimit: estimate.gasLimit + gasBuffer,
    storageLimit: estimate.storageLimit,
    amount: amount,
    mutez: true,
  });
  await new Promise((resolve, reject) => {
    const evts = [];

    op.confirmationObservable(1).subscribe(
      (event) => {
        const entry = {
          level: event.block.header.level,
          currentConfirmation: event.currentConfirmation,
        };
        evts.push(entry);
      },
      () => reject(null),
      () => {
        toast.success('Transaction posted');
        resolve(evts);
      }
    );
  });
};

export const claimOwner = async (transactionId) => {
  const contract = await tezos.wallet.at(contractAddress);
  const opEntry = contract.methods
    .claimOwner(transactionId)
    .toTransferParams({});

  const estimate = await tezos.estimate.transfer(opEntry);

  const op = await contract.methods.claimOwner(transactionId).send({
    fee:
      estimate.suggestedFeeMutez +
      increasedFee(gasBuffer, Number(estimate.opSize)),
    gasLimit: estimate.gasLimit + gasBuffer,
    storageLimit: estimate.storageLimit,
    mutez: true,
  });
  await new Promise((resolve, reject) => {
    const evts = [];

    op.confirmationObservable(1).subscribe(
      (event) => {
        const entry = {
          level: event.block.header.level,
          currentConfirmation: event.currentConfirmation,
        };
        evts.push(entry);
      },
      () => reject(null),
      () => {
        toast.success('Transaction posted');
        resolve(evts);
      }
    );
  });
};

export const claimCounterparty = async (transactionId, secret) => {
  const params = {
    transactionId: transactionId,
    secret: secret,
  };

  const contract = await tezos.wallet.at(contractAddress);
  const opEntry = contract.methodsObject
    .claimCounterparty(params)
    .toTransferParams({});

  const estimate = await tezos.estimate.transfer(opEntry);

  const op = await contract.methodsObject.claimCounterparty(params).send({
    fee:
      estimate.suggestedFeeMutez +
      increasedFee(gasBuffer, Number(estimate.opSize)),
    gasLimit: estimate.gasLimit + gasBuffer,
    storageLimit: estimate.storageLimit,
    mutez: true,
  });
  await new Promise((resolve, reject) => {
    const evts = [];

    op.confirmationObservable(1).subscribe(
      (event) => {
        const entry = {
          level: event.block.header.level,
          currentConfirmation: event.currentConfirmation,
        };
        evts.push(entry);
      },
      () => reject(null),
      () => {
        toast.success('Transaction posted');
        resolve(evts);
      }
    );
  });
};

export const cancelOwner = async (transactionId) => {
  const contract = await tezos.wallet.at(contractAddress);
  const opEntry = contract.methods
    .cancelCommissionOwner(transactionId)
    .toTransferParams({});

  const estimate = await tezos.estimate.transfer(opEntry);

  const op = await contract.methods.cancelCommissionOwner(transactionId).send({
    fee:
      estimate.suggestedFeeMutez +
      increasedFee(gasBuffer, Number(estimate.opSize)),
    gasLimit: estimate.gasLimit + gasBuffer,
    storageLimit: estimate.storageLimit,
    mutez: true,
  });
  await new Promise((resolve, reject) => {
    const evts = [];

    op.confirmationObservable(1).subscribe(
      (event) => {
        const entry = {
          level: event.block.header.level,
          currentConfirmation: event.currentConfirmation,
        };
        evts.push(entry);
      },
      () => reject(null),
      () => {
        toast.success('Transaction posted');
        resolve(evts);
      }
    );
  });
};

export const cancelCounterparty = async (transactionId) => {
  const contract = await tezos.wallet.at(contractAddress);
  const opEntry = contract.methods
    .cancelCommissionCounterparty(transactionId)
    .toTransferParams({});

  const estimate = await tezos.estimate.transfer(opEntry);

  const op = await contract.methods
    .cancelCommissionCounterparty(transactionId)
    .send({
      fee:
        estimate.suggestedFeeMutez +
        increasedFee(gasBuffer, Number(estimate.opSize)),
      gasLimit: estimate.gasLimit + gasBuffer,
      storageLimit: estimate.storageLimit,
      mutez: true,
    });
  await new Promise((resolve, reject) => {
    const evts = [];

    op.confirmationObservable(1).subscribe(
      (event) => {
        const entry = {
          level: event.block.header.level,
          currentConfirmation: event.currentConfirmation,
        };
        evts.push(entry);
      },
      () => reject(null),
      () => {
        toast.success('Transaction posted');
        resolve(evts);
      }
    );
  });
};

export const postCommission = async (transaction) => {
  const contract = await tezos.wallet.at(contractAddress);
  const transactionId = uuidv4();
  transaction.transactionId = transactionId;
  const opEntry = contract.methodsObject
    .postCommission(transaction)
    .toTransferParams({});
  const estimate = await tezos.estimate.transfer(opEntry);

  const op = await contract.methodsObject.postCommission(transaction).send({
    fee:
      estimate.suggestedFeeMutez +
      increasedFee(gasBuffer, Number(estimate.opSize)),
    gasLimit: estimate.gasLimit + gasBuffer,
    storageLimit: estimate.storageLimit,
  });

  await new Promise((resolve, reject) => {
    const evts = [];

    op.confirmationObservable(1).subscribe(
      (event) => {
        const entry = {
          level: event.block.header.level,
          currentConfirmation: event.currentConfirmation,
        };
        evts.push(entry);
      },
      () => reject(null),
      () => {
        toast.success('Transaction posted');
        resolve(evts);
      }
    );
  });
};

export const createTransaction = async () => {
  const contract = await tezos.wallet.at(contractAddress);
  const opEntry = contract.methods.createTransaction().toTransferParams({});
  const estimate = await tezos.estimate.transfer(opEntry);

  const op = await contract.methods.createTransaction().send({
    fee:
      estimate.suggestedFeeMutez +
      increasedFee(gasBuffer, Number(estimate.opSize)),
    gasLimit: estimate.gasLimit + gasBuffer,
    storageLimit: estimate.storageLimit,
  });

  await new Promise((resolve, reject) => {
    const evts = [];

    op.confirmationObservable(1).subscribe(
      (event) => {
        const entry = {
          level: event.block.header.level,
          currentConfirmation: event.currentConfirmation,
        };
        evts.push(entry);
      },
      () => reject(null),
      () => {
        toast.success('Transaction posted');
        resolve(evts);
      }
    );
  });
};

export const revertCommissionFunds = async (transactionId) => {
  const contract = await tezos.wallet.at(contractAddress);
  const opEntry = contract.methods
    .revertCommissionFunds(transactionId)
    .toTransferParams({});

  const estimate = await tezos.estimate.transfer(opEntry);

  const op = await contract.methods.revertCommissionFunds(transactionId).send({
    fee:
      estimate.suggestedFeeMutez +
      increasedFee(gasBuffer, Number(estimate.opSize)),
    gasLimit: estimate.gasLimit + gasBuffer,
    storageLimit: estimate.storageLimit,
    mutez: true,
  });

  await new Promise((resolve, reject) => {
    const evts = [];

    op.confirmationObservable(1).subscribe(
      (event) => {
        const entry = {
          level: event.block.header.level,
          currentConfirmation: event.currentConfirmation,
        };
        evts.push(entry);
      },
      () => reject(null),
      () => {
        toast.success('Transaction posted');
        resolve(evts);
      }
    );
  });
};
