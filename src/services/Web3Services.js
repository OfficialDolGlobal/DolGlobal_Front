import { ethers } from "ethers";
import USDTABI from '../abis/usdt.abi.json'
import TOKENABI from '../abis/token.abi.json'
import TREASURYABI from '../abis/treasury.abi.json'
import COLLECTIONABI from '../abis/nft_collection.abi.json'
import USERABI from '../abis/user.abi.json'


const RPC_URL = import.meta.env.VITE_RPC_URL;
const USDT_ADDRESS = import.meta.env.VITE_USDT_TOKEN_ADDRESS;
const TOKEN_ADDRESS = import.meta.env.VITE_DOL_TOKEN_ADDRESS;
const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS;
const USER_ADDRESS = import.meta.env.VITE_USER_REFERRAL_ADDRESS;

const COLLECTION_ADDRESS = import.meta.env.VITE_COLLECTION_ADDRESS;


export const getProvider = () => {
    if (!window.ethereum) throw new Error("No MetaMask found");
    return new ethers.BrowserProvider(window.ethereum);
};

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