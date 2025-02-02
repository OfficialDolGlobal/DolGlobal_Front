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

const API_URL = "https://dol-server.vercel.app";

const App = () => {
  // Estado original
  const [isConnected, setIsConnected] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [userWallet, setUserWallet] = useState(null);
  const [showMobileModal, setShowMobileModal] = useState(false);

  // Estados para o cadastro
  const [registrationStep, setRegistrationStep] = useState("start");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [sponsorAddress, setSponsorAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userData, setUserData] = useState(null);
  const [locationPermission, setLocationPermission] = useState(true);

  // Verificar parâmetro de referência na URL ao carregar
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref && ref.length === 42 && ref.startsWith("0x")) {
      const address = ref.toLowerCase();
      setSponsorAddress(address);
      // Se estiver no passo de sponsor, verificar automaticamente
      if (registrationStep === "sponsor") {
        verifySponsor();
      }
    }
  }, []);

  // Verificar se o usuário já existe quando conectar a carteira
  const checkExistingUser = async (address) => {
    try {
      const response = await axios.post(`${API_URL}/api/verify-user`, {
        walletAddress: address.toLowerCase(),
      });
      // Agora incluindo dados do supabase na resposta
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

  // Função para verificar se email/telefone já existem
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
      // Se o erro for que não encontrou o registro, retorna false
      return false;
    }
  };

  async function getUserLocation() {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      // Usar a API do Nominatim para obter detalhes do endereço
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );

      const address = response.data.address;

      return {
        country: address.country,
        country_code: address.country_code?.toUpperCase(),
        state: address.state,
        city: address.city || address.town || address.village,
        postcode: address.postcode,
        latitude,
        longitude,
      };
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  }

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

            // Verificar se o usuário existe
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

  // Funções de cadastro
  const verifySponsor = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`${API_URL}/api/verify-sponsor`, {
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

      // Verificar se email já existe
      await checkDuplicateData("email", emailToVerify);

      await axios.post(`${API_URL}/api/send-email`, {
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
  
      console.log('Enviando verificação:', {
        email: emailToVerify,
        code: codeToVerify
      }); // Log para debug
  
      const response = await axios.post(`${API_URL}/api/verify-email`, {
        email: emailToVerify,
        code: codeToVerify.toString().trim() // Garantir que o código está como string e sem espaços
      });
  
      if (response.data.success) {
        setRegistrationStep("phone");
        setSuccess("Email verified successfully");
      }
    } catch (error) {
      console.error('Erro na verificação:', error); // Log para debug
      setError(error.response?.data?.error || "Invalid email code");
    } finally {
      setLoading(false);
    }
  };

  const sendPhoneCode = async (phoneNumber) => {
    // Receber o número direto como parâmetro
    try {
      setLoading(true);
      setError("");

      // Verificar se telefone já existe
      await checkDuplicateData("phone", phoneNumber);

      await axios.post(`${API_URL}/api/send-sms`, {
        phoneNumber, // Usar o parâmetro direto, não o estado
      });

      setRegistrationStep("phoneVerification");
      setSuccess("Verification code sent to your phone");
    } catch (error) {
      setError(error.message || "Error sending SMS code");
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneCode = async (phoneNumber, code) => {
    // Receber tanto o número quanto o código
    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`${API_URL}/api/verify-sms`, {
        phoneNumber, // Usar os parâmetros diretos
        code,
      });

      if (response.data.success) {
        await registerUser();
      }
    } catch (error) {
      setError(error.response?.data?.error || "Invalid phone code");
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async () => {
    try {
      setLoading(true);

      // Obter localização do usuário
      const location = await getUserLocation();

      // Primeiro registrar no contrato
      const createResponse = await axios.post(`${API_URL}/api/create-user`, {
        userAddress: userWallet.toLowerCase(),
        sponsorAddress: sponsorAddress.toLowerCase(),
      });

      if (createResponse.data.success) {
        // Depois salvar dados no Supabase
        await axios.post(`${API_URL}/api/register`, {
          userAddress: userWallet.toLowerCase(),
          sponsorAddress: sponsorAddress.toLowerCase(),
          email,
          phone,
          location: location || {},
        });

        setSuccess("Registration completed successfully");
        setIsConnected(true);
        setActivePage("home");

        // Atualizar dados do usuário
        const userData = await checkExistingUser(userWallet);
        if (userData) {
          setUserData(userData);
        }
      }
    } catch (error) {
      setError(error.response?.data?.error || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  // Modal para Dispositivos Móveis
  const MobileConnectModal = () => {
    const { t } = useLanguage(); // Hook para traduções

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
    const checkLocationPermission = async () => {
      try {
        const result = await navigator.permissions.query({
          name: "geolocation",
        });
        setLocationPermission(result.state === "granted");

        result.onchange = () => {
          setLocationPermission(result.state === "granted");
        };
      } catch (error) {
        console.error("Erro ao verificar permissão de localização:", error);
        setLocationPermission(false);
      }
    };

    checkLocationPermission();
  }, []);

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
            locationPermission={locationPermission}
            initialSponsorAddress={sponsorAddress}
            onSponsorVerify={(address) => {
              setSponsorAddress(address);
              verifySponsor();
            }}
            onEmailSend={(newEmail) => {
              setEmail(newEmail);
              // Passar email diretamente para sendEmailCode para evitar problemas com o estado
              sendEmailCode(newEmail);
            }}
            onEmailVerify={({ email, code }) => {
              setEmail(email);
              setEmailCode(code);
              verifyEmailCode(email, code);  // <-- Agora passamos os parâmetros
            }}
            onPhoneSend={(phoneNumber) => {
              setPhone(phoneNumber);
              sendPhoneCode(phoneNumber); // Passar o número direto
            }}
            onPhoneVerify={({ phone: phoneNumber, code }) => {
              setPhone(phoneNumber);
              setPhoneCode(code);
              verifyPhoneCode(phoneNumber, code); // Passar ambos os valores direto
            }}
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
