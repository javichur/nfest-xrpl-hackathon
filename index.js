const tokenOfferIndex='298348F44FE9CB7AEFEC7C43A3B80D65ACDB8C341D716514B471DE7401B85275';
const wss = "wss://xls20-sandbox.rippletest.net:51233";
//seccion
const seccionWallets = document.querySelector('#add_wallet');
const seccionLoad = document.querySelector('#loaders');
const iconLoad = document.querySelector('#iconLoad');

//buttons
const btnConnect = document.querySelector('#connect');
const btnCreate = document.querySelector('#create');
//progessBar
const progressBar = document.querySelector("#progressbar");
const progressDef = document.querySelector("#progress-def");
//input
const seed = document.querySelector("#secret");

let wallet;


//functions
const createWallet = async() => {
  updateProgress(30,'Creating Wallet...');
  const fetchResponse = await fetch(`https://faucet-nft.ripple.com/accounts`,{
      method: "POST",
      mode: 'cors',
      headers: {
          'Content-Type': 'application/json',
      }
  });
  const data = await fetchResponse.json();
  wallet = await xrpl.Wallet.fromSeed(data.account.secret);
  return wallet;
}

const updateProgress = ( percentage, txt ) => {
  if(txt){
    progressDef.innerHTML=txt
  }
  progressBar.style.width = percentage + "%";
}

//***************************
//** Accept Sell Offer ******
//***************************

async function acceptSellOffer(toi) {
	wallet = await xrpl.Wallet.fromSeed(wallet.seed)
	const client = new xrpl.Client("wss://xls20-sandbox.rippletest.net:51233")
	await client.connect()
	console.log("Connected to Sandbox")

 // Prepare transaction -------------------------------------------------------
  const transactionBlob = {
      	"TransactionType": "NFTokenAcceptOffer",
      	"Account": wallet.classicAddress,
      	"SellOffer": toi,
  }
  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(transactionBlob,{wallet});
  const nfts = await client.request({
	method: "account_nfts",
	account: wallet.classicAddress
  })
  console.log(JSON.stringify(nfts,null,2))

  // Check transaction results -------------------------------------------------
  console.log("Transaction result:",
    JSON.stringify(tx.result.meta.TransactionResult, null, 2))
  console.log("Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2))
  client.disconnect()
  // End of acceptSellOffer()
}

const getWallet = async(seed) => {
  updateProgress(10,'Connecting XRPL...');
  const client = new xrpl.Client(wss);
	await client.connect();
  updateProgress(20,'Connected XRPL');
  if(seed){
    wallet = await xrpl.Wallet.fromSeed(seed);
  }else{
    await createWallet();
  }
  
  updateProgress(40,'Set Wallet');
  console.log(wallet);
  client.disconnect();
}

const nextStep = (step) => {
  if(step==1){
    seccionWallets.style.display = "none";
    seccionLoad.style.display = "block";
  }
  else if(step==2){
    iconLoad.classList.remove("mdi-wallet-outline");
    iconLoad.classList.add("mdi-check");
  }
}

const getNFT = async(tokenOfferIndex) => {
  await acceptSellOffer();
}

const init = async(seed) => {
  nextStep(1);
  await getWallet();
  updateProgress(60,'Transferring NFT to your wallet...');
  await acceptSellOffer(tokenOfferIdex);
  updateProgress(100,'Finished, Now you have your free NFT');
  nextStep(2);
}
//events

btnConnect.addEventListener('click',(e) => { 
  console.log(e)
  if(!seed.value)alert('error');
  init(seed.value)
});

btnCreate.addEventListener('click', (e) => { 
  console.log(e)
  init();

});