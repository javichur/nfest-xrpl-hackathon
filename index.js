const urlIpfs = "https://ipfs.io/ipfs/";
const wss = "wss://xls20-sandbox.rippletest.net:51233";
//seccion
const seccionWallets = document.querySelector('#add_wallet');
const seccionLoad = document.querySelector('#loaders');
const iconLoad = document.querySelector('#iconLoad');
const galery = document.querySelector('#galery');

//buttons
const btnConnect = document.querySelector('#connect');
const btnCreate = document.querySelector('#create');
//progessBar
const progressBar = document.querySelector("#progressbar");
const progressDef = document.querySelector("#progress-def");
//input
const seed = document.querySelector("#secret");
// nft
const nftContainer = document.querySelector("#nft-container");

// walletInfo
const secretW = document.querySelector('#w-secret');
const addressW = document.querySelector('#w-addres');
const publicK = document.querySelector('#publicK');

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
	const client = new xrpl.Client(wss)
	await client.connect()
	console.log("Connected to Sandbox")

  const transactionBlob = {
      	"TransactionType": "NFTokenAcceptOffer",
      	"Account": wallet.classicAddress,
      	"SellOffer": toi,
  }

  const tx = await client.submitAndWait(transactionBlob,{wallet});
  if(tx.result.meta.TransactionResult=='tecOBJECT_NOT_FOUND')throw Error('NFT reward not exist or already delivered');
  if(tx.result.meta.TransactionResult!='tesSUCCESS')throw Error('Undefined');
  client.disconnect()
}

const setDomWallet = () => {
  secretW.innerHTML = wallet.seed;
  addressW.innerHTML = wallet.classicAddress;
  publicK.innerHTML= wallet.publicKey;
}

const getWallet = async(seed) => {
 
  const client = new xrpl.Client(wss);
	await client.connect();
  updateProgress(20,'Connected XRPL');
  if(seed){
    wallet = await xrpl.Wallet.fromSeed(seed);
  }else{
    await createWallet();
  }
  setDomWallet();
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
  }else if(step==3){
    seccionWallets.style.display = "none";
    seccionLoad.style.display = "none";
    galery.style.display = "block";
  }else if(step===0){
    seccionWallets.style.display = "block";
    seccionLoad.style.display = "none";
    galery.style.display = "none";
  }
}
const  showNFTS = async() => {
  const nfts = await getTokens();
  nfts.map(addNFT);
}


async function getTokens() {
	wallet = xrpl.Wallet.fromSeed(wallet.seed);
	const client = new xrpl.Client(wss)
	await client.connect();
	const nfts = await client.request({
		method: "account_nfts",
		account: wallet.classicAddress
	})
	return nfts.result.account_nfts;
} 

const getNFT = async(tokenOfferIndex) => {
  await acceptSellOffer();
}

const init = async(seed) => {
  try{
    updateProgress(10,'Connecting XRPL...');
    nextStep(1);
    await getWallet(seed);
    updateProgress(60,'Transferring NFT to your wallet...');
    await acceptSellOffer(tokenOfferIdex);
    updateProgress(100,'Finished, Now you have your free NFT');
    nextStep(2);
    await showNFTS();
    nextStep(3);
  }catch(error){
    toastr.warning('An error has occurred: "'+error+'", try again');
    nextStep(0);
  }
}

const uri2url = uri => xrpl.convertHexToString(uri).replace('ipfs://', urlIpfs);

const addNFT = (nft) => {
  const div = document.createElement('div');
  div.innerHTML =  `
  <div class="col-3">
    <div class="card border text-left">
      <img class="card-img-top img-fluid" src="${uri2url(nft.URI)}">
      <div class="card-body">
        <p class="card-text text-muted font-13 m-1">${xrpl.convertHexToString(nft.URI)}</p>
      </div>
    </div>
  </div>`;
  nftContainer.append(div.firstElementChild);
}


//events

btnConnect.addEventListener('click',(e) => { 
  console.log(e)
  if(!seed.value) return toastr.warning('You should add a valid seed.');
  init(seed.value)
});

btnCreate.addEventListener('click', (e) => { 
  console.log(e)
  init();

});