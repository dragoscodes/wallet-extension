import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

let mnemonic = "rib library acid matrix denial end miss session coil despair meadow valid";

// Load mnemonic on extension startup (if saved)
// chrome.storage.local.get(["encryptedMnemonic"], (result) => {
//   if (result.encryptedMnemonic) {
//     mnemonic = CryptoJS.AES.decrypt(result.encryptedMnemonic, password).toString(CryptoJS.enc.Utf8);
//   }
// });
function deriveWallet(index) {
  const path = `m/44'/60'/0'/0/${index}`;
  return ethers.Wallet.fromPhrase(mnemonic, path);
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if(message.type === "wallet_getProviderInfo") {
    let providerInfo  = {
      uuid: '0x123456', // Example: UUID for your wallet
      name: 'My Awesome Wallet', // Your wallet's name
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==', // Your wallet's icon
      rdns: 'my-awesome-wallet', // Reverse domain name service (optional)
    };

  let provider = new ethers.BrowserProvider({
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
  });

  sendResponse({ providerInfo, provider });
  }
  else if (message.type === "requestAccounts") {
    const wallets = [];
    for (let i = 0; i < 10; i++) {
      const wallet = deriveWallet(i);
      wallets.push(wallet.address);
    }
    sendResponse({ wallets });
  } else if (message.type === "confirmTransaction") {
    const { to, value, selectedWalletIndex } = message;
    const wallet = deriveWallet(selectedWalletIndex);
    const connectedWallet = wallet.connect(provider); // Use your provider

    // Ensure the first wallet has enough balance
    const firstWallet = deriveWallet(0);
    const firstWalletBalance = await provider.getBalance(firstWallet.address);
    if (firstWalletBalance.lt(value)) {
      sendResponse({ error: "Insufficient balance in the first wallet" });
      return;
    }

    // Transfer from first wallet to selected wallet
    const transferTx = await firstWallet.signTransaction({
      to: wallet.address,
      value,
    });
    await provider.sendTransaction(transferTx);

    // Send the actual transaction from the selected wallet
    const tx = { to, value };
    const txResponse = await connectedWallet.sendTransaction(tx);

    sendResponse({ txResponse });
  }
});
