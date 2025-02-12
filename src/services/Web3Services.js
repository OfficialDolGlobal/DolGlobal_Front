import { ethers } from "ethers";
import USDTABI from '../abis/usdt.abi.json'
import TREASURYABI from '../abis/treasury.abi.json'
import TRACKERABI from '../abis/payment_tracker.abi.json'
import COLLECTIONABI from '../abis/nft_collection.abi.json'
import USERABI from '../abis/user.abi.json'
import axios from "axios";



const USDT_ADDRESS = import.meta.env.VITE_USDT_TOKEN_ADDRESS;
const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS;
const TRACKER_ADDRESS = import.meta.env.VITE_PAYMENT_TRACKER_ADDRESS;

const USER_ADDRESS = import.meta.env.VITE_USER_REFERRAL_ADDRESS;
const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const COLLECTION_ADDRESS = import.meta.env.VITE_COLLECTION_ADDRESS;


export const getProvider = () => {
    if (!window.ethereum) throw new Error("No MetaMask found");
    return new ethers.BrowserProvider(window.ethereum);
};
export const checkEmail = async (email) => {
    try {
        const response = await axios.get(`${API_URL}api/check-email`, {
            params: { email },
            headers: {
                'x-api-key': API_KEY 
            }
        });
        
        return response.data.emailExists; 
    } catch (error) {
        console.error('Error checking email:', error);
        throw error; 
    }
}
export const updateValidation = async (email,phoneNumber, signatureEmail,signaturePhone) => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const user_address = signer.address.toLowerCase()  
    
    
    try {
        const response = await axios.post(`${API_URL}api/validation`, {
            email,
            phoneNumber,
            user_address,
            signatureEmail,
            signaturePhone
        }, {
            headers: {
                'x-api-key': API_KEY 
            }
        });
        return response; 
    } catch (error) {
        console.error('Error updating email:', error);
        throw error; 
    }
}
export const createUser = async (userAddress, sponsorAddress,signature) => {
    
    try {
        await axios.post(`${API_URL}api/create-user`, {
            userAddress,
            sponsorAddress,
            signature
          },{
            headers: {
                'x-api-key': API_KEY 
            }});

    } catch (error) {
        console.error('Error updating email:', error);
        throw error; 
    }
}
export const sendEmail = async (email) => {
    
    try {
        await axios.post(`${API_URL}api/send-email`, {
            email
          },{
            headers: {
                'x-api-key': API_KEY 
            }});


    } catch (error) {
        console.error('Error updating email:', error);
        throw error; 
    }
}
export const sendSms = async (phoneNumber,user_address,signature) => {
    
    try {
        await axios.post(`${API_URL}api/send-sms`, {
            phoneNumber,
            user_address,
            signature
          },{
            headers: {
                'x-api-key': API_KEY 
            }});



    } catch (error) {
        console.error('Error updating email:', error);
        throw error; 
    }
}
export const verifyEmailBack = async (email,code,user_address,signature) => {
    
    try {
        const response = await axios.post(`${API_URL}api/verify-email`, {
            email,
            code,
            user_address,
            signature
          },{
            headers: {
                'x-api-key': API_KEY 
            }});
        return response


    } catch (error) {
        console.error('Error updating email:', error);
        throw error; 
    }
}
export const verifyPhoneBack = async (phoneNumber,code,user_address,signature) => {
    
    try {
        const response = await axios.post(`${API_URL}api/verify-sms`, {
            phoneNumber,
            code,
            user_address,
            signature
          }, {headers: {
            'x-api-key': API_KEY 
        }});
    

        return response


    } catch (error) {
        console.error('Error updating email:', error);
        throw error; 
    }
}
export const addLogs = async (ip,location, device,signature) => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const user_address = signer.address.toLowerCase()  
    
    try {
        const response = await axios.post(`${API_URL}api/insert-logs`, {
            user_address,
            ip,
            location,
            device,
            signature
        }, {
            headers: {
                'x-api-key': API_KEY 
            }
        });
        return response; 

    } catch (error) {
        console.error('Error adding logs:', error);
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
export function isValidSignature(signature) {
    return typeof signature === 'string' && /^0x[a-fA-F0-9]{130}$/.test(signature);
  }
  
export const verifyMessage = (message,signature,owner)=>{
    const recoveredAddress = ethers.verifyMessage(message, signature).toLowerCase();
    
    if (owner !== recoveredAddress) {
        return false;
    }else{
        return true;
    }

}
export const getUserData = async (owner) => {
    try {
        const response = await axios.get(`${API_URL}api/userData?sponsorId=${owner}`,{
            headers: {
                'x-api-key': API_KEY 
            }
        });
        return response.data; 
    } catch (error) {
        console.error('Error getting user data:', error);
        throw error; 
    }
};
export const getPendingUser = async (owner) => {
    try {
        const response = await axios.get(`${API_URL}api/pendingUser?user_address=${owner}`,{
            headers: {
                'x-api-key': API_KEY 
            }
        });
        return response; 
    } catch (error) {
        console.error('Error getting user pending data:', error);
        throw error; 
    }
};

export const getUserTree = async (owner) => {
    
    try {
        const response = await axios.get(`${API_URL}api/tree?sponsorId=${owner}`,{
            headers: {
                'x-api-key': API_KEY 
            }
        });
        return response; 
    } catch (error) {
        console.error('Error getting user tree:', error);
        throw error; 
    }
};


export const checkBlacklist = async (user_address, cookie_value,signature) => {
    try {
        const response = await axios.post(`${API_URL}api/check-cookie`, {
            user_address,
            cookie_value,
            signature
        }, {
            headers: {
                'x-api-key': API_KEY 
            }
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
            params: { phone }, 
                headers: {
                    'x-api-key': API_KEY 
                }
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

export const payTracker = async () => {
    try {
        const provider = getProvider(); 
        const signer = await provider.getSigner(); 
        
        const paymentTracker = new ethers.Contract(TRACKER_ADDRESS, TRACKERABI, signer);
                
       const tx = await paymentTracker.pay()

        await tx.wait();
        return tx;
    } catch (error) {
        console.error('Failed to pay USDT:', error);
        throw new Error('Transaction failed: ' + error.message);
    }
}

export const isUserPaid = async (owner) => {
    try {
        const provider = getProvider(); 
        
        const paymentTracker = new ethers.Contract(TRACKER_ADDRESS, TRACKERABI, provider);
                
       const isPaid = await paymentTracker.hasPaid(owner)

        return isPaid;
    } catch (error) {
        console.error('Failed to check payment:', error);
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
export const getUserTotalEarnedNetwork = async (owner) => {
    try {
        const provider = getProvider(); 
        
        const userContract = new ethers.Contract(USER_ADDRESS, USERABI, provider);

        
        const totalEarned = await userContract.userTotalEarned(owner);

        return totalEarned;

    } catch (error) {
        console.error('Failed to get total investment:', error);
        throw new Error('Transaction failed: ' + error.message);
    }
}
export const getUserTotalLostedNetwork = async (owner) => {
    try {
        const provider = getProvider(); 
        
        const userContract = new ethers.Contract(USER_ADDRESS, USERABI, provider);

        
        const totalLosted = await userContract.userTotalLosted(owner);

        return totalLosted;

    } catch (error) {
        console.error('Failed to get total investment:', error);
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