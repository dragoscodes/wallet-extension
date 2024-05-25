window.ethereum = {
    isMetaMask: true,
    selectedAddress: null, // Initially null
    request: async (request) => {
      if (request.method === 'eth_requestAccounts') {
        console.log("Requesting accounts");
        const permitted = await chrome.runtime.sendMessage({ type: 'requestAccounts' }); // Ask the background script for permission
        if (permitted) {
          const accounts = await getAccountsFromStorage(); // Your storage logic (e.g., localStorage)
          window.ethereum.selectedAddress = accounts[0]; // Update the selected address
          return accounts;
        } else {
          throw new Error("User denied account access");
        }
      } else if (request.method === 'eth_sendTransaction') {
        // Get the transaction details
        const transaction = request.params[0];
        // Prompt the user for confirmation (UI in the extension popup)
        const confirmed = await chrome.runtime.sendMessage({ type: 'confirmTransaction', transaction });
        if (confirmed) {
          const txHash = await sendTransaction(transaction); // Your transaction sending logic
          return txHash;
        } else {
          throw new Error("User rejected transaction");
        }
      }
      // Handle other methods (eth_sign, eth_signTypedData, etc.)
    }
  };