// Fetch wallet data from the background script
chrome.runtime.sendMessage({ type: "eth_requestAccounts" }, (response) => {
    const walletList = document.getElementById("walletList");
  
    response.wallets.forEach((wallet, index) => {
      const walletItem = document.createElement("div");
      walletItem.textContent = `Address: ${wallet.address}, Balance: ${ethers.formatEther(wallet.balance)} ETH`;
      walletItem.onclick = () => {
        // Send the selected wallet index back to the content script
        window.postMessage({ type: "WALLET_SELECTED", index }); 
        window.close(); // Close the popup
      };
      walletList.appendChild(walletItem);
    });
  });
  
  