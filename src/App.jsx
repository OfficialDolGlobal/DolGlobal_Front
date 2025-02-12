import React, { useState, useEffect } from "react";
import Home from "./components/pages/Home";
import Network from "./components/pages/Network";
import Contribute from "./components/pages/Contribute";
import NFTs from "./components/pages/NFTs";
import Profile from "./components/pages/Profile";
import LandingPage from "./components/pages/LandingPage";
import NavigationMenu from "./components/shared/NavigationMenu";
import ContributionModal from "./components/modals/ContributionModal";
import { LanguageManager, useLanguage } from "./components/LanguageManager";
import { translations } from "./translations";
import { NotificationProvider } from "./components/modals/useNotification";
import RegistrationForm from "./components/shared/RegistrationForm";
import { checkEmail, checkPhone, createUser, getPendingUser, getSignature, getUser, isUserPaid, payTracker, sendEmail, sendSms, verifyEmailBack, verifyPhoneBack } from "./services/Web3Services";

const contractUser = import.meta.env.VITE_USER_REFERRAL_ADDRESS;

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [userWallet, setUserWallet] = useState(null);
  const [showMobileModal, setShowMobileModal] = useState(false);

  const [registrationStep, setRegistrationStep] = useState("start");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneSignature, setPhoneSignature] = useState("");


  const [sponsorAddress, setSponsorAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [emailLoadingVerify, setEmailLoadingVerify] = useState(false);
  const [phoneLoadingVerify, setPhoneLoadingVerify] = useState(false);


  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get("ref");
      if (ref && ref.length === 42 && ref.startsWith("0x")) {
        const address = ref.toLowerCase();
        
        if (registrationStep === "sponsor") {
          await verifySponsor(address);
        }
      }
    };
  
    fetchInitialData(); // Chamada imediata da função assíncrona interna
  }, [registrationStep]); // Não se esqueça de listar as dependências corretamente, aqui coloquei registrationStep como exemplo.
  
  
  




  const handleConnect = async () => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        if (typeof window.ethereum !== "undefined") {
          try {
            const accounts = await window.ethereum.request({
              method: "eth_requestAccounts",
            });
            if (accounts[0]) {
              const address = accounts[0].toLowerCase();
              setUserWallet(address);
              const userData = await getUser(address)
              

              if (userData[0]) {
                setUserData(userData);
                setIsConnected(true);
                setActivePage("home");
              } else {
                try {
                  const response = await getPendingUser(address)
                  
                  if(!response.data.email_verified){
                    setRegistrationStep("email");
  
                  }else if(!response.data.phone_verified){
                    setRegistrationStep("phone");
  
                  }else{
                    setUserData(userData);
                    setIsConnected(true);
                    setActivePage("home");                  
                  }
                } catch (error) {
                  
                  setRegistrationStep("sponsor");
                }
  
              }
            }
          } catch (error) {
            console.error("Error connecting MetaMask:", error);
            setShowMobileModal(true);
          }
        } else {
          setShowMobileModal(true);
        }
      } else {
        if (typeof window.ethereum !== "undefined") {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });

          if (accounts[0]) {
            const address = accounts[0];
            setUserWallet(address);
            
            const userData = await getUser(address)

            if (userData[0]) {
              setUserData(userData);
              setIsConnected(true);
              setActivePage("home");
            } else {
              try {
                const response = await getPendingUser(address)
                
                if(!response.data.email_verified){
                  setRegistrationStep("email");

                }else if(!response.data.phone_verified){
                  setRegistrationStep("phone");

                }else{
                  setUserData(userData);
                  setIsConnected(true);
                  setActivePage("home");                  
                }
              } catch (error) {
                
                setRegistrationStep("sponsor");
              }

            }
          }
        } else {
          window.open("https://metamask.io/download/", "_blank");
        }
      }
    } catch (error) {
      console.error("Connection error:", error);
      setError("Error connecting to MetaMask. Please try again.");
    }
  };

  const handleDisconnect = () => {
    setUserWallet(null);
    setIsConnected(false);
    setActivePage("home");
    setRegistrationStep("start");
    setUserData(null);
  };

  const verifySponsor = async (sponsor) => {
    setSponsorAddress(sponsor);
    
    try {
      setLoading(true);
      setError(""); 
      let sponsorData;
      try {
        sponsorData = await getUser(sponsor);
      } catch (error) {
        setRegistrationStep("sponsor"); 
        setSponsorAddress(false)
        throw new Error("Invalid sponsor address"); 
      }
  
      if (sponsorData[0]) {
        setSuccess("Sponsor verified successfully");        
        setRegistrationStep("email");

      } else {
        setRegistrationStep("sponsor"); 
        setSponsorAddress(false)
        throw new Error("Invalid sponsor address"); 
        
      }
    } catch (error) {
      setError(error.message || "Error verifying sponsor");
    } finally {
      setLoading(false);
    }
  };
  
  const verifyEmail = async (email) => {
    setEmail(email);
    try {
      setSuccess("")
      setLoading(true);
      setError(""); 
      const emailExist = await checkEmail(email)
      if(emailExist){
        setEmail(false)
        setError("Email address already exist")
        throw new Error("Email address already exist"); 
      }else{
        setSuccess("Email successfully verified and set");
        
        try {
          
          const response = await getPendingUser(address)
          
          if(response.data.phone_verified){
            setRegistrationStep("verifyCode"); 
          }
        } catch (error) {
        }
        setRegistrationStep("phone");


      }
  

    } catch (error) {
      setError(error.response.data.error || "Error verifying email");
    } finally {
      setLoading(false);
    }
  };
  const verifyPhone = async (phone) => {
    setPhone(phone);
    try {
      setSuccess("")
      setLoading(true);
      setError(""); 
      const phoneExist = await checkPhone(phone)
      if(phoneExist){
        setPhone(false)
        setError("Phone number already exist")
        throw new Error("Phone number already exist"); 
      }else{
        setSuccess("Phone successfully verified and set");
        const isPaid = await isUserPaid(userWallet)
        if(isPaid){
          setRegistrationStep("verifyCode"); 

        }else{
          setRegistrationStep("usdtTransfer"); 
        }
      }
  

    } catch (error) {
      setError(error.response.data.error || "Error verifying phone");
    } finally {
      setLoading(false);
    }
  };
  

  const sendEmailCode = async (emailToVerify) => {
    try {
      setEmailLoading(true);
      setError("");
      setSuccess("");

      await sendEmail(emailToVerify)


      setSuccess("Verification code sent to your email");

    } catch (error) {
      setError(error.message || "Error sending email code");
    } finally {
      setEmailLoading(false);
    }
  };
  
  const sendPhoneCode = async (phoneToVerify) => {
    try {
      setPhoneLoading(true);
      setError("");
      setSuccess("");

      const signature = await getSignature(phoneToVerify)
      setPhoneSignature(signature)
      await sendSms(phoneToVerify,userWallet,signature)

      setSuccess("Verification code sent to your phone");
    } catch (error) {
      setError(error.message || "Error sending phone code");
    } finally {
      setPhoneLoading(false);
    }
  };

  const verifyEmailCode = async (emailToVerify, codeToVerify) => {
    try {
      setEmailLoadingVerify(true);
      setError("");

      const signature = await getSignature(emailToVerify)
      const response = await verifyEmailBack(emailToVerify,codeToVerify.toString().trim(),userWallet,signature)

      if (response.data.success) {
        setEmail("")
        setSuccess("Email code verified")
        const response = await getPendingUser(userWallet)

        if(response.data.phone_verified && response.data.email_verified){
          setIsConnected(true);
          setActivePage("home");
        }
      }


    } catch (error) {
      console.error('Erro na verificação:', error);
      setError(error.response?.data?.error || "Invalid email code");
    } finally {
      setEmailLoadingVerify(false);
    }
  };
  const verifyPhoneCode = async (phoneToVerify, codeToVerify) => {
    try {
      setPhoneLoadingVerify(true);
      setError("");

      const response = await verifyPhoneBack(phoneToVerify,codeToVerify.toString().trim(),userWallet,phoneSignature)


      if (response.data.success) {
        setPhone("")
        const response = await getPendingUser(userWallet)

        if(response.data.phone_verified && response.data.email_verified){
          setIsConnected(true);
          setActivePage("home");
        }
      }


    } catch (error) {
      console.error('Erro na verificação:', error);
      setError(error.response?.data?.error || "Invalid phone code");
    } finally {
      setPhoneLoadingVerify(false);
    }
  };

  const registerUser = async () => {
    try {
      setLoading(true);
      setSuccess("")
      setError("")

      await payTracker();
      const signature = await getSignature(sponsorAddress.toLowerCase())
      await createUser(userWallet.toLowerCase(),sponsorAddress.toLowerCase(),signature)


        setSuccess("Registration completed successfully");        
        setRegistrationStep("verifyCode");

        
        


      
    } catch (error) {
      console.log(error);
      
      setError(error.response?.data?.error || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  const MobileConnectModal = () => {
    const { t } = useLanguage()

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-[#001952] p-6 rounded-2xl max-w-md w-full border border-white/10">
          <div className="flex flex-col items-center mb-6">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/2048px-MetaMask_Fox.svg.png"
              alt="MetaMask"
              className="w-20 h-20 mb-4"
            />
            <h3 className="text-xl font-bold mb-2 text-white">
              {t.metamask.connect}
            </h3>
            <p className="text-gray-300 text-center">
              {t.metamask.mobileInstructions}
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() =>
                (window.location.href = `https://metamask.app.link/dapp/${window.location.host}`)
              }
              className="w-full p-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl text-white font-semibold hover:opacity-90 transition-all"
            >
              {t.metamask.openInApp}
            </button>

            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full p-4 border border-white/20 rounded-xl text-white text-center hover:bg-white/5 transition-all"
            >
              {t.metamask.install}
            </a>

            <button
              onClick={() => setShowMobileModal(false)}
              className="w-full p-4 bg-white/5 rounded-xl text-white hover:bg-white/10 transition-all"
            >
              {t.general.close}
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          handleDisconnect();
        } else {
          setUserWallet(accounts[0].toLowerCase());
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleDisconnect);
      }
    };
  }, []);

  return (
    <NotificationProvider>
      <LanguageManager translations={translations}>
        {showMobileModal && <MobileConnectModal />}

        {!isConnected && registrationStep === "start" && (
          <LandingPage onConnect={handleConnect} />
        )}

        {!isConnected && registrationStep !== "start" && (
          <RegistrationForm
          emailLoading={emailLoading}
          phoneLoading={phoneLoading}
          emailLoadingVerify={emailLoadingVerify}
          phoneLoadingVerify={phoneLoadingVerify}
          userAddress={userWallet}
            registrationStep={registrationStep}
            setLoading={setLoading}
            loading={loading}
            success={success}
            error={error}
            phone={phone}
            email={email}
            initialSponsorAddress={sponsorAddress}
            onSponsorVerify={async(address) => {
              await verifySponsor(address);
            }}
            onEmailSend={async (newEmail) => {
              verifyEmail(newEmail)
            }}
            onPhoneSend={async(newPhone)=>{
              verifyPhone(newPhone)
            }}
            onEmailVerify={({ email, code }) => {
              setEmail(email);
              verifyEmailCode(email, code);
            }}
            onPhoneVerify={({ phone, code }) => {
              setPhone(phone);
              verifyPhoneCode(phone, code);
            }}
            onEmailSendCode={(email)=>{
              sendEmailCode(email)
            }}
            onPhoneSendCode={(phone)=>{
              sendPhoneCode(phone)
            }}
            onUsdtTransfer={async()=>{
              
              await registerUser()}}

          />
        )}

        {isConnected && (
          <div className="min-h-screen bg-[#000c2a] text-white">
            <div className="p-6 max-w-7xl mx-auto relative pb-24">
              {activePage === "home" && (
                <Home
                  contractAddress={contractUser}
                  setActivePage={setActivePage}
                  userData={userData}
                />
              )}
              {activePage === "network" && <Network userWallet={userWallet} />}
              {activePage === "contribute" && <Contribute />}
              {activePage === "nfts" && <NFTs />}
              {activePage === "profile" && (
                <Profile
                  userWallet={userWallet}
                  onDisconnect={handleDisconnect}
                  userData={userData}
                />
              )}

              <NavigationMenu
                activePage={activePage}
                setActivePage={setActivePage}
                setIsContributionModalOpen={setIsContributionModalOpen}
              />

              <ContributionModal
                isOpen={isContributionModalOpen}
                onClose={() => setIsContributionModalOpen(false)}
              />
            </div>
          </div>
        )}
      </LanguageManager>
    </NotificationProvider>
  );
};

export default App;