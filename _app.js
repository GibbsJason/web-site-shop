import React, { useState, useEffect } from 'react';
import { Box, Text, Center, VStack, CSSReset, ChakraProvider } from "@chakra-ui/react";
import './HomePage.css'; 
import SideMenu from '.components/Sidemenu/'

function HomePage() {
  const [wallets, setWallets] = useState([]);
  const [walletData, setWalletData] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState('home'); // Track the selected menu item

  useEffect(() => {
    // Fetch data for each wallet in the list
    const fetchDataForWallets = async () => {
      const walletPromises = wallets.map(async (wallet) => {
        const apiUrl1 = 'https://block-explorer-api.mainnet.zksync.io/address/' + wallet;
        const apiUrl2 = 'https://explorer.zora.energy/api/v2/addresses/' + wallet;
        
        const response1 = await fetch(apiUrl1);
        const data1 = await response1.json();
        
        const response2 = await fetch(apiUrl2);
        const data2 = await response2.json();
        
        const apiUrl3 = 'https://block-explorer-api.mainnet.zksync.io/transactions?address=' + wallet;
        let totalFee = 0;
        
        // Fetch transactions data from multiple pages
        let totalPages = 1;
        let page = 1;
        
        do {
          const response3 = await fetch(apiUrl3 + '&limit=100&page=' + page);
          const data3 = await response3.json();
          
          // Calculate the total fee from transactions on this page
          data3.items.forEach((item) => {
            const feeWei = parseInt(item.fee);
            totalFee += feeWei;
          });
          
          // Check if there are more pages to fetch
          totalPages = data3.totalPages;
          page++;
        } while (page <= totalPages);
        
        return {
          wallet,
          sealedNonce: data1.sealedNonce,
          tokenBalance: data1.balances['0x000000000000000000000000000000000000800A']
            ? (data1.balances['0x000000000000000000000000000000000000800A'].balance / 100000000000000000).toFixed(4) + " ETH"
            : "Token not found",
          exchangeRate2: data2.exchange_rate,
          totalTransactionFee: (totalFee / 1e18),
        };
      });
      
      const walletResults = await Promise.all(walletPromises);
      setWalletData(walletResults);
    };
    
    fetchDataForWallets();
  }, [wallets]);
  
  const handleWalletChange = (event) => {
    const newWallets = event.target.value.split('\n').map((wallet) => wallet.trim());
    setWallets(newWallets);
  };
  
  const handleMenuClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
    // You can add logic to handle menu item clicks here
  };
  
  return (
    <div className="container">
      <div className="sidebar">
      <div className="logo">
       <img src='https://i.ibb.co/hdWY882/logo.png' alt="Logo" />
       <center> FroggyDao </center>
        </div>
        <ul>
          <li className={selectedMenuItem === 'home' ? 'active' : ''} onClick={() => handleMenuClick('home')}>ZkSync</li>
          <li className={selectedMenuItem === 'settings' ? 'active' : ''} onClick={() => handleMenuClick('settings')}>Starknet</li>
          <li className={selectedMenuItem === 'about' ? 'active' : ''} onClick={() => handleMenuClick('about')}>Zora</li>
        </ul>
      </div>
      <div className="content">
        <div className="button-table-container">
          <label htmlFor="walletInput">Enter Wallet Addresses (one per line): </label>
          <textarea
            id="walletInput"
            value={wallets.join('\n')}
            onChange={handleWalletChange}
          />
          <table>
            <thead>
              <tr>
                <th>Wallet</th>
                <th>TXn</th>
                <th>Balance ETH</th>
                <th>Total Transaction Fee</th>
              </tr>
            </thead>
            <tbody>
              {walletData.map((walletInfo, index) => (
                <tr key={index}>
                  <td>{walletInfo.wallet}</td>
                  <td>{walletInfo.sealedNonce}</td>
                  <td>{walletInfo.tokenBalance}</td>
                  <td>
                    {walletInfo.tokenBalance !== null && walletInfo.exchangeRate2 !== null
                      ? (parseFloat(walletInfo.totalTransactionFee) * parseFloat(walletInfo.exchangeRate2))
                      : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
