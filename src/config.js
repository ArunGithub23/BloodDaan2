import { ethers } from 'ethers';
import ABI from './build/contracts/Bloodtoken.json'
//const provider = new ethers.BrowserProvider(window.ethereum)
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");

export const contractAddress =  ' 0xA50Eebbfc6d58A0C21ce583a724Bdf368e3CcA5B'



export async function connectWallet() {
    try {
      // Detecting Ethereum provider
      if (window.ethereum) {
        // Initialize ethers.js with the detected provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log("provider",provider)
  
        // Request access to the user's accounts
       const account= await window.ethereum.request({ method: "eth_requestAccounts" });

  console.log("acc",account[0]);
        // Get the signer (user's wallet)
        const signer = provider.getSigner();
  
        // Return the signer (user's wallet)
        return account[0];
      } else {
        throw new Error("No Ethereum provider detected");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error.message);
      return null;
    }
  }


export async function addIdentity(name, account,email,pass,address,coords,typeid){
    try {
        const signer =await  provider.getSigner();
        const contract = new ethers.Contract(contractAddress, ABI.abi, signer);
        console.log("contract is ",contract);
        const tx = await contract.connect(signer).addIdentity(name, account,email,pass,address,coords,typeid);
        await tx.wait();
    } catch (error) {
        console.log(error)
    }
    
}

export async function isloginValid(account,email,pass) {
    try {
      console.log("okk")
        const contract = new ethers.Contract(contractAddress, ABI.abi, provider);
        console.log("okk1")
        const bloodBankDetails = await contract.isloginValid(account,email,pass);
        console.log("bb",bloodBankDetails)
        return bloodBankDetails;
    } catch (error) {
        console.log(error);
        return [];
    }
}

export async function getLoginDetails(account) {
    try {
        const contract = new ethers.Contract(contractAddress, ABI.abi, provider);
        const bloodBankDetails = await contract.getLoginDetails(account);
        console.log("bb",bloodBankDetails)
        return bloodBankDetails;
    } catch (error) {
        console.log(error);
        return [];
    }
}



