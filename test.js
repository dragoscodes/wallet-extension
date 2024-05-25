import { ethers } from 'ethers';

async function main() {

  // 1. Start Hardhat Local Testnet and get Signer
  const provider = new ethers.JsonRpcProvider();

  const signer = provider.getSigner();

  console.log("Signer Address:", await (await signer).getAddress() );
  // 2. Generate Wallets (Your Code)
//   const myMnemonic = ethers.Mnemonic.fromEntropy(ethers.randomBytes(16));
    const myMnemonic = "rib library acid matrix denial end miss session coil despair meadow valid";

    const mnemonicInstance = ethers.Mnemonic.fromPhrase(myMnemonic);

    // const wallet = ethers.Wallet.fromPhrase(myMnemonic);

    // const hdwallet = ethers.HDNodeWallet.fromMnemonic(myMnemonic);

    // const connected = hdwallet.connect(provider);

    const wallets = [];
    for (let i = 0; i < 10; i++) {
        const path = `m/44'/60'/0'/0/${i}`;
        const acct = ethers.HDNodeWallet.fromMnemonic(mnemonicInstance, path);
        wallets.push(acct);
    }
    console.log(wallets);

    //send a transaction from the third wallet to the fifth wallet
    const tx = {
        to: wallets[4].address,
        value: ethers.parseEther("0.1"),
    };

    const signedTx = await wallets[2].signTransaction(tx);

    const connected = wallets[2].connect(provider);

    const txResponse = await connected.sendTransaction(tx);

    console.log(signedTx);
    console.log(txResponse);

    const contractFactory = new ethers.ContractFactory(
        [
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_initialData",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "oldValue",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "newValue",
                        "type": "uint256"
                    }
                ],
                "name": "ValueChanged",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "get",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_newValue",
                        "type": "uint256"
                    }
                ],
                "name": "set",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "storedData",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ], 
        "608060405234801561001057600080fd5b50604051610355380380610355833981810160405281019061003291906100b4565b806000819055507f2db947ef788961acc438340dbcb4e242f80d026b621b7c98ee3061995039038260008260405161006b929190610135565b60405180910390a15061015e565b600080fd5b6000819050919050565b6100918161007e565b811461009c57600080fd5b50565b6000815190506100ae81610088565b92915050565b6000602082840312156100ca576100c9610079565b5b60006100d88482850161009f565b91505092915050565b6000819050919050565b6000819050919050565b600061011061010b610106846100e1565b6100eb565b61007e565b9050919050565b610120816100f5565b82525050565b61012f8161007e565b82525050565b600060408201905061014a6000830185610117565b6101576020830184610126565b9392505050565b6101e88061016d6000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80632a1afcd91461004657806360fe47b1146100645780636d4ce63c14610080575b600080fd5b61004e61009e565b60405161005b9190610110565b60405180910390f35b61007e6004803603810190610079919061015c565b6100a4565b005b6100886100ee565b6040516100959190610110565b60405180910390f35b60005481565b600080549050816000819055507f2db947ef788961acc438340dbcb4e242f80d026b621b7c98ee3061995039038281836040516100e2929190610189565b60405180910390a15050565b60008054905090565b6000819050919050565b61010a816100f7565b82525050565b60006020820190506101256000830184610101565b92915050565b600080fd5b610139816100f7565b811461014457600080fd5b50565b60008135905061015681610130565b92915050565b6000602082840312156101725761017161012b565b5b600061018084828501610147565b91505092915050565b600060408201905061019e6000830185610101565b6101ab6020830184610101565b939250505056fea2646970667358221220ea5b1add0d49968d56e223e0463903d643b8f182a4141e19b4b99abfe909532764736f6c63430008130033", 
        wallets[5].connect(provider) // Connect the sixth wallet to the provider
      );
    
      const contract = await contractFactory.deploy(
        155,
        {
          gasLimit: 3000000,
        }
      );
      await contract.waitForDeployment();
      console.log("Contract deployed to:", await contract.getAddress());
    
      // Interact with the contract from the seventh wallet
      const contractWithSigner = contract.connect(wallets[6].connect(provider)); // Connect the seventh wallet
      const result = await contractWithSigner.get();
      console.log("Result from function call:", result);


}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
