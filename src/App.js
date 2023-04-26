import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ContractDataContext } from './contexts/contract-data';
import { AccountDataContextProvider } from './contexts/account-data';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Transaction from './pages/Transaction';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <BrowserRouter basename="/task-chain">
      <ToastContainer />
      <ContractDataContext>
        <AccountDataContextProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route
              path="/transaction/:transactionId"
              element={<Transaction />}
            />
          </Routes>
        </AccountDataContextProvider>
      </ContractDataContext>
    </BrowserRouter>
  );
}

export default App;
