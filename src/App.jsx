import React, { useState, useEffect } from "react";
import axios from "axios";
import Home from "./components/pages/Home";
import Network from "./components/pages/Network";
import Contribute from "./components/pages/Contribute";
import NFTs from "./components/pages/NFTs";
import Profile from "./components/pages/Profile";
import LandingPage from "./components/pages/LandingPage";
import NavigationMenu from "./components/shared/NavigationMenu";
import ContributionModal from "./components/modals/ContributionModal";
import { LanguageManager } from "./components/LanguageManager";
import { translations } from "./translations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { NotificationProvider } from "./components/modals/useNotification";
import RegistrationForm from "./components/shared/RegistrationForm";

const contractUser = import.meta.env.VITE_USER_REFERRAL_ADDRESS;
const API_URL = "https://api2-git-main-btc-aid.vercel.app/";
const IPINFO_TOKEN = "3c3735468fa3e5";

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [userWallet, setUserWallet] = useState(null);
  const [showMobileModal, setShowMobileModal] = useState(false);

  const [registrationStep, setRegistrationStep] = useState("start");
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [sponsorAddress, setSponsorAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref && ref.length === 42 && ref.startsWith("0x")) {
      const address = ref.toLowerCase();
      setSponsorAddress(address);
      if (registrationStep === "sponsor") {
        verifySponsor();
      }
    }
  }, []);
  const handleUsdtTransferCompleted = async(receipt) => {
    await registerUser(receipt); 
    setActivePage("home");
};
  
  
  async function getUserLocation() {
    try {
      // Usando apenas ipinfo.io para obter a localização
      const response = await axios.get(`https://ipinfo.io/json?token=${IPINFO_TOKEN}`);
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
      // Em caso de erro, retornamos um objeto vazio mas válido
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

  const checkExistingUser = async (address) => {
    try {
      const response = await axios.post(`${API_URL}api/verify-user`, {
        walletAddress: address.toLowerCase(),
      });
      return {
        exists: response.data.exists,
        faceId: response.data.faceId,
        userData: response.data.userData,
      };
    } catch (error) {
      console.error("Error checking user:", error);
      return null;
    }
  };

  const checkDuplicateData = async (type, value) => {
    try {
      const { data: existingUser } = await supabase
        .from("users")
        .select()
        .eq(type, value)
        .single();

      if (existingUser) {
        throw new Error(`This ${type} is already registered`);
      }
      return false;
    } catch (error) {
      if (error.message.includes("already registered")) {
        throw error;
      }
      return false;
    }
  };

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

              const existingUser = await checkExistingUser(address);
              if (existingUser?.exists) {
                setUserData({
                  ...existingUser,
                  isVerified: existingUser.faceId,
                });
                setIsConnected(true);
                setActivePage("home");
              } else {
                setRegistrationStep("sponsor");
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

            const existingUser = await checkExistingUser(address);
            if (existingUser?.exists) {
              setUserData(existingUser);
              setIsConnected(true);
              setActivePage("home");
            } else {
              setRegistrationStep("sponsor");
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

  const verifySponsor = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`${API_URL}api/verify-sponsor`, {
        sponsorAddress: sponsorAddress.toLowerCase(),
      });

      if (response.data.valid) {
        setRegistrationStep("email");
        setSuccess("Sponsor verified successfully");
      } else {
        setError("Invalid sponsor address");
      }
    } catch (error) {
      setError(error.response?.data?.error || "Error verifying sponsor");
    } finally {
      setLoading(false);
    }
  };

  const sendEmailCode = async (emailToVerify) => {
    try {
      setLoading(true);
      setError("");

      await checkDuplicateData("email", emailToVerify);

      await axios.post(`${API_URL}api/send-email`, {
        email: emailToVerify,
      });
      setRegistrationStep("emailVerification");
      setSuccess("Verification code sent to your email");
    } catch (error) {
      setError(error.message || "Error sending email code");
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailCode = async (emailToVerify, codeToVerify) => {
    try {
      setLoading(true);
      setError("");


      const response = await axios.post(`${API_URL}api/verify-email`, {
        email: emailToVerify,
        code: codeToVerify.toString().trim()
      });
      if (response.data.success) {
        setRegistrationStep("usdtTransfer");
      }


    } catch (error) {
      console.error('Erro na verificação:', error);
      setError(error.response?.data?.error || "Invalid email code");
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (receipt) => {
    try {
      setLoading(true);

      const location = await getUserLocation();


        await axios.post(`${API_URL}api/register`, {
          userAddress: userWallet.toLowerCase(),
          sponsorAddress: sponsorAddress.toLowerCase(),
          email,
          location: location || {},
        });
        const createResponse = await axios.post(`${API_URL}api/create-user`, {
          userAddress: userWallet.toLowerCase(),
          sponsorAddress: sponsorAddress.toLowerCase(),
          transactionHash: receipt.hash

        });

        setSuccess("Registration completed successfully");
        setIsConnected(true);
        setActivePage("home");

        const userData = await checkExistingUser(userWallet);
        if (userData) {
          setUserData(userData);
        }
      
    } catch (error) {
      setError(error.response?.data?.error || "Error 'creating user");
    } finally {
      setLoading(false);
    }
  };

  const MobileConnectModal = () => {
    const { t } = useLanguage();

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
            registrationStep={registrationStep}
            loading={loading}
            success={success}
            error={error}
            initialSponsorAddress={sponsorAddress}
            onSponsorVerify={(address) => {
              setSponsorAddress(address);
              verifySponsor();
            }}
            onEmailSend={(newEmail) => {
              setEmail(newEmail);
              sendEmailCode(newEmail);
            }}
            onEmailVerify={({ email, code }) => {
              setEmail(email);
              setEmailCode(code);
              verifyEmailCode(email, code);
            }}
            onUsdtTransfer={handleUsdtTransferCompleted}

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