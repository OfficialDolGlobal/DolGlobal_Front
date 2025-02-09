import { ethers } from "ethers";
import USDTABI from '../abis/usdt.abi.json'
import TOKENABI from '../abis/token.abi.json'
import TREASURYABI from '../abis/treasury.abi.json'
import COLLECTIONABI from '../abis/nft_collection.abi.json'
import USERABI from '../abis/user.abi.json'
import axios from "axios";



const RPC_URL = import.meta.env.VITE_RPC_URL;
const USDT_ADDRESS = import.meta.env.VITE_USDT_TOKEN_ADDRESS;
const TOKEN_ADDRESS = import.meta.env.VITE_DOL_TOKEN_ADDRESS;
const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS;
const USER_ADDRESS = import.meta.env.VITE_USER_REFERRAL_ADDRESS;
const API_URL = "https://api2-btc-aid.vercel.app/";

const COLLECTION_ADDRESS = import.meta.env.VITE_COLLECTION_ADDRESS;


export const getProvider = () => {
    if (!window.ethereum) throw new Error("No MetaMask found");
    return new ethers.BrowserProvider(window.ethereum);
};
export const checkEmail = async (email) => {
    try {
        const response = await axios.get(`${API_URL}api/check-email`, {
            params: { email }
        });
        console.log(response);
        
        return response.data.emailExists; 
    } catch (error) {
        console.error('Error checking email:', error);
        throw error; 
    }
}
export const getSignature = async (message) => {
    try {
        const provider = getProvider();
        const signer = await provider.getSigner();
        const signature = await signer.signMessage(message);
        return signature;
    } catch (error) {
        console.error("Error while signing the message:", error);
        throw new Error("Failed to sign the message. Please check your wallet connection.");
    }
};

export const checkBlacklist = async (user_address, cookie_value,signature) => {
    try {
        const response = await axios.post(`${API_URL}api/check-cookie`, {
            user_address,
            cookie_value,
            signature
        });
        return response.data; 
    } catch (error) {
        if (error.response) {
            console.error("Error status:", error.response.status);
            console.error("Error data:", error.response.data);
        } else if (error.request) {
            console.error("No response received");
        } else {
            console.error("Error setting up request:", error.message);
        }
        throw error; 
    }
};
export const checkPhone = async (phone) => {
    try {
        const response = await axios.get(`${API_URL}api/check-phone`, {
            params: { phone }
        });
        return response.data.phoneExists; 
    } catch (error) {
        console.error('Error checking phone:', error);
        throw error; 
    }
}
export const getUserIp = async () => {
    try {
        const response = await axios.get('https://api.ipify.org?format=json');
        return response.data.ip;
    } catch (error) {
        console.error('Erro to get IP:', error);
        return null; 
    }
}
export const approveUsdt = async (address, amount) => {
    try {
        const provider = getProvider(); 
        const signer = await provider.getSigner(); 
        
        const usdtContract = new ethers.Contract(USDT_ADDRESS, USDTABI, signer);
        
        
        const tx = await usdtContract.approve(address, amount);

        await tx.wait();

    } catch (error) {
        console.error('Failed to approve USDT:', error);
        throw new Error('Transaction failed: ' + error.message);
    }
}

export const transferUsdt = async (address, amount) => {
    try {
        const provider = getProvider(); 
        const signer = await provider.getSigner(); 
        
        const usdtContract = new ethers.Contract(USDT_ADDRESS, USDTABI, signer);
                
       const tx = await usdtContract.transfer(address, amount)

        await tx.wait();
        return tx;
    } catch (error) {
        console.error('Failed to transfer USDT:', error);
        throw new Error('Transaction failed: ' + error.message);
    }
}

export const mintNftGlobal = async (amount) => {
    try {
        const provider = getProvider(); 
        const signer = await provider.getSigner(); 
        
        const collectionContract = new ethers.Contract(COLLECTION_ADDRESS, COLLECTIONABI, signer);
        
        
        const tx = await collectionContract.mintNftGlobal(amount);

        await tx.wait();

    } catch (error) {
        console.error('Failed to mint nft:', error);
        throw new Error('Transaction failed: ' + error.message);
    }
}


export const allowanceUsdt = async (owner, spender) => {
    try {
        const provider = getProvider(); 
        
        const usdtContract = new ethers.Contract(USDT_ADDRESS, USDTABI, provider);
        
        
        const allowanceValue = await usdtContract.allowance(owner, spender);

        return allowanceValue;

    } catch (error) {
        console.error('Failed to get allowance USDT:', error);
        throw new Error('Transaction failed: ' + error.message);
    }
}
export const balanceUsdt = async (owner) => {
    try {
        const provider = getProvider(); 
        
        const usdtContract = new ethers.Contract(USDT_ADDRESS, USDTABI, provider);
        
        
        const balanceValue = await usdtContract.balanceOf(owner);

        return balanceValue;

    } catch (error) {
        console.error('Failed to get balance USDT:', error);
        throw new Error('Transaction failed: ' + error.message);
    }
}
export const contractClaim = async (index) => {
    try {
        const provider = getProvider(); 
        const signer = await provider.getSigner(); 

        const treasuryContract = new ethers.Contract(TREASURY_ADDRESS, TREASURYABI, signer);

        
        const tx = await treasuryContract.claimContribution(index);
        await tx.wait()

    } catch (error) {
        console.error('Failed to claim contribution:', error);
        throw new Error('Transaction failed: ' + error.message);
    }
}

export const availableUnilevel = async (owner) => {
    try {
        const provider = getProvider(); 

        const collectionContract = new ethers.Contract(COLLECTION_ADDRESS, COLLECTIONABI, provider);
        
        
        const availableStruct = await collectionContract.users(owner);

        return availableStruct;

    } catch (error) {
        console.error('Failed to get available unilevel:', error);
        throw new Error('Transaction failed: ' + error.message);
    }
}

export const getUserTotalInvestment = async (owner) => {
    try {
        const provider = getProvider(); 
        
        const treasuryContract = new ethers.Contract(TREASURY_ADDRESS, TREASURYABI, provider);

        
        const totalInvested = await treasuryContract.userTotalContributionsValue(owner);

        return totalInvested;

    } catch (error) {
        console.error('Failed to get total investment:', error);
        throw new Error('Transaction failed: ' + error.message);
    }
}

export const getUser = async (owner) => {
    try {
        const provider = getProvider(); 
        
        const userContract = new ethers.Contract(USER_ADDRESS, USERABI, provider);

        
        const userData = await userContract.getUser(owner);
        
        return userData;

    } catch (error) {
        console.error('Failed to get user:', error);
        throw new Error('Transaction failed: ' + error.message);
    }
}

export const getUserTotalEarnedTreasury = async (owner) => {
    try {
        const provider = getProvider(); 
        
        const treasuryContract = new ethers.Contract(TREASURY_ADDRESS, TREASURYABI, provider);

        
        const totalEarned = await treasuryContract.userTotalEarned(owner);

        return totalEarned;

    } catch (error) {
        console.error('Failed to get total investment:', error);
        throw new Error('Transaction failed: ' + error.message);
    }
}

export const getTimeUntilClaim = async (owner,index) => {
    try {
        const provider = getProvider(); 
        
        const treasuryContract = new ethers.Contract(TREASURY_ADDRESS, TREASURYABI, provider);

        
        const timeUntilClaim = await treasuryContract.timeUntilNextWithdrawal(owner,index);

        return timeUntilClaim;

    } catch (error) {
        console.error('Failed to get time until claim:', error);
        throw new Error('Transaction failed: ' + error.message);
    }
}
export const getTotalEarnedPerDay = async (owner,startIndex) => {
    try {
        const provider = getProvider(); 
        
        const treasuryContract = new ethers.Contract(TREASURY_ADDRESS, TREASURYABI, provider);

        
        const dailyGain = await treasuryContract.calculateDailyGain(owner,startIndex);

        return dailyGain;

    } catch (error) {
        console.error('Failed to get daily gain:', error);
        throw new Error('Transaction failed: ' + error.message);
    }
}   

export const getNextContributionToClaim = async (owner,startIndex) => {
    try {
        const provider = getProvider(); 
        
        const treasuryContract = new ethers.Contract(TREASURY_ADDRESS, TREASURYABI, provider);

        
        const nextContribution = await treasuryContract.getNextClaim(owner,startIndex);

        return nextContribution;

    } catch (error) {
        console.error('Failed to get next contribution:', error);
        throw new Error('Transaction failed: ' + error.message);
    }
}   
export const previewValueToClaim = async (owner,index) => {
    try {
        const provider = getProvider(); 
        
        const treasuryContract = new ethers.Contract(TREASURY_ADDRESS, TREASURYABI, provider);

        
        const valueToClaim = await treasuryContract.previewClaim(owner,index);

        return valueToClaim;

    } catch (error) {
        console.error('Failed to value to claim:', error);
        throw new Error('Transaction failed: ' + error.message);
    }
}   

export const getUserLocation= async()=> {
    try {
      const response = await axios.get(`https://ipinfo.io/json?token=3c3735468fa3e5`);
      const { country, region, city, postal, loc } = response.data;
      const [latitude, longitude] = loc.split(',').map(coord => parseFloat(coord));

      return {
        country,
        country_code: country,
        state: region,
        city,
        postcode: postal,
        latitude,
        longitude,
      };
    } catch (error) {
      console.error("Error getting location from IP:", error);
      return {
        country: "",
        country_code: "",
        state: "",
        city: "",
        postcode: "",
        latitude: 0,
        longitude: 0
      };
    }
  }