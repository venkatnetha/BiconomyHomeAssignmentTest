
import './App.css';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Modal from './Modal.js';
import { Biconomy } from "@biconomy/mexa";

import tlscwalletartifact from './artifacts/contracts/TLSCWallet.sol/TLSCWallet.json';
import maticArtifact from './artifacts/contracts/Matic.sol/Matic.json';
import shibArtifact from './artifacts/contracts/Shib.sol/Shib.json';
import usdtArtifact from './artifacts/contracts/Usdt.sol/Usdt.json';


const TimeLockSmartWalletAddress = "0x4d0535753c84AE8817ddF26082D4a38A02aa5f78"

function App() {
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [signerAddress, setSignerAddress] = useState(undefined);
  const [tlscwalletContract, setTlswContract] = useState(undefined);
  const [tokenContracts, setTokenContracts] = useState({});
  const [tokenBalances, setTokenBalances] = useState({});
  const [tokenSymbols, setTokenSymbols] = useState([]);

  const [amount, setAmount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(undefined);
  const [isDeposit, setIsDeposit] = useState(true);

  const toBytes32 = text => ( ethers.utils.formatBytes32String(text) );
  const toString = bytes32 => ( ethers.utils.parseBytes32String(bytes32) );
  const toWei = ether => ( ethers.utils.parseEther(ether) );
  const toEther = wei => ( ethers.utils.formatEther(wei).toString() );
  const toRound = num => ( Number(num).toFixed(2) );

  useEffect(() => {
    const init = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)

      const tlswContract = await new ethers.Contract(TimeLockSmartWalletAddress, tlscwalletartifact.abi,provider)
      setTlswContract(tlswContract)

      tlswContract.connect(provider).getWhiteListenTokenSymbols()
        .then((result) => {
          const symbols = result.map(s => toString(s))
          setTokenSymbols(symbols)
          getTokenContracts(symbols, tlswContract, provider)

        })
    }
    init();
  }, [])

  const getTokenContract = async (symbol, tlswContract, provider) => {
    const address = await tlswContract.connect(provider).getWhiteListedTokenAddress( toBytes32(symbol) );
    const abi = symbol === 'Matic' ? maticArtifact.abi : (symbol === 'Shib' ? shibArtifact.abi : usdtArtifact.abi);
    const tokenContract = new ethers.Contract(address, abi,provider);
    return tokenContract
  }

  const getTokenContracts = async (symbols, tlswContract, provider) => {
    symbols.map(async symbol => {
      const contract = await getTokenContract(symbol, tlswContract, provider)
      setTokenContracts(prev => ({...prev, [symbol]:contract}))
    })
  }

  const isConnected = () => (signer !== undefined)

  const getSigner = async provider => {
    provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    signer.getAddress()
      .then(address => {
        setSignerAddress(address)
      })

    return signer
  }

  const connect = () => {
    getSigner(provider)
      .then(signer => {
        setSigner(signer)
        getTokenBalances(signer)
      })
  }

  const getTokenBalance = async (symbol, signer) => {
    const tlswContract = new ethers.Contract(TimeLockSmartWalletAddress, tlscwalletartifact.abi,provider);
    const balance = await tlswContract.connect(signer).getTokenBalance( toBytes32(symbol) );
    return toEther(balance);
  }

  const getTokenBalances = (signer) => {
    tokenSymbols.map(async symbol => {
      const balance = await getTokenBalance(symbol, signer)
      setTokenBalances(prev => ({...prev, [symbol]: balance.toString()}))
    })
  }

  const displayModal = (symbol) => {
    setSelectedSymbol(symbol)
    setShowModal(true)
  }

  const depositTokens = async (wei, symbol) => {
    const accounts = await requestAccounts();
    console.log(accounts[0].balance)
    const tlswContract = new ethers.Contract(TimeLockSmartWalletAddress, tlscwalletartifact.abi,provider)
    if (symbol === 'Eth') {
      signer.sendTransaction({
        to: tlswContract.address,
        value: wei
      })
    } else {
      const tokenContract = tokenContracts[symbol]
      console.log("before approve")
      console.log(symbol)
      console.log(wei)
      tokenContract.connect(signer).approve(tlswContract.address, wei)
        .then(() => {
          console.log(tokenContract)
          
          tlswContract.connect(signer).depositTokens(toBytes32(symbol),wei,{gasLimit: 120000});
        })        
    }
  }

  async function requestAccounts() {
    return await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  const withdrawTokens = async (wei,symbol) => {
    
    if(symbol === 'Eth'){
      claimEther(wei);
    } else {
      claimTokens(wei,symbol);
    }
    
  }

  const claimTokens = async(wei,symbol) =>{
    const accounts = await requestAccounts();
    console.log("before biconomu init")
      const biconomy = new Biconomy(
        window.ethereum,
        {
          apiKey: "fdv5maeoG.ab0d7882-bc75-486d-958e-74d72f2b79f1",
          debug: true,
          contractAddresses: [TimeLockSmartWalletAddress]
        }
      );
      
      const provider = await biconomy.provider;      
      const tlswContract =  new ethers.Contract(TimeLockSmartWalletAddress, tlscwalletartifact.abi,biconomy.ethersProvider);
      await biconomy.init();

      const { data } = await tlswContract.populateTransaction.claimTokens(toBytes32(symbol),wei); 
     
      let txParams = {
        data: data,
        to: TimeLockSmartWalletAddress,
        from: accounts[0],
        signatureType: "EIP712_SIGN",
      };

      console.log("before");
      await provider.send("eth_sendTransaction", [txParams]);
      console.log("after");
  }

  const claimEther = async(wei) => {
    const accounts = await requestAccounts();
    console.log("before biconomu init")
      const biconomy = new Biconomy(
        window.ethereum,
        {
          apiKey: "fdv5maeoG.ab0d7882-bc75-486d-958e-74d72f2b79f1",
          debug: true,
          contractAddresses: [TimeLockSmartWalletAddress]
        }
      );
      
      const provider = await biconomy.provider;      
      const tlswContract =  new ethers.Contract(TimeLockSmartWalletAddress, tlscwalletartifact.abi,biconomy.ethersProvider)
      await biconomy.init();

      const { data } = await tlswContract.populateTransaction.claimEther(wei); 
     
      let txParams = {
        data: data,
        to: TimeLockSmartWalletAddress,
        from: accounts[0],
        signatureType: "EIP712_SIGN",
      };

      console.log("before")
      await provider.send("eth_sendTransaction", [txParams]);
      console.log("after");  
  }

  const depositOrWithdraw = (e, symbol) => {
    e.preventDefault();
    const wei = toWei(amount)

    if(isDeposit) {
      depositTokens(wei, symbol)
    } else {
      withdrawTokens(wei, symbol)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Biconomy Home Assignment</h1>
        <h3>Time locked Smart Contract Wallet</h3>
        {isConnected() ? (
          <div>
            <p>
              Welcome {signerAddress?.substring(0,10)}...
            </p>
            <div>
              <div className="list-group">
                <div className="list-group-item">
                  {Object.keys(tokenBalances).map((symbol, idx) => (
                    <div className=" row d-flex py-3" key={idx}>

                      <div className="col-md-3">
                        <div>{symbol.toUpperCase()}</div>
                      </div>

                      <div className="d-flex gap-4 col-md-3">
                        <small className="opacity-50 text-nowrap">{toRound(tokenBalances[symbol])}</small>
                      </div>

                      <div className="d-flex gap-4 col-md-6">
                        <button onClick={ () => displayModal(symbol) } className="btn btn-primary">Deposit/Withdraw</button>
                        <Modal
                          show={showModal}
                          onClose={() => setShowModal(false)}
                          symbol={selectedSymbol}
                          depositOrWithdraw={depositOrWithdraw}
                          isDeposit={isDeposit}
                          setIsDeposit={setIsDeposit}
                          setAmount={setAmount}
                        />
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div>
            <p>
              You are not connected
            </p>
            <button onClick={connect} className="btn btn-primary">Connect Metamask</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;