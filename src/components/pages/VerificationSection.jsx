import React, { useState, useEffect } from "react";
import { Shield, AlertCircle } from "lucide-react";
import { ethers } from "ethers";
import CONTRACT_ABI from "../../abis/user.abi.json";
import { getProvider } from "../../services/Web3Services";

const USER_CONTRACT = import.meta.env.VITE_USER_REFERRAL_ADDRESS;

const VerificationSection = ({ userWallet }) => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const VERIFF_API_KEY = "f2423655-8e99-4db3-a3a8-74ddafe4031d";
  const VERIFF_API_URL = "https://stationapi.veriff.com";

  useEffect(() => {
    if (userWallet) {
      checkVerificationStatus();
    }
  }, [userWallet]);

  const checkVerificationStatus = async () => {
    try {
      const provider = await getProvider();
      const contract = new ethers.Contract(
        USER_CONTRACT,
        CONTRACT_ABI,
        provider
      );

      const userData = await contract.getUser(userWallet);

      console.log("Dados do usuário:", userData);

      setIsRegistered(userData[0]); // registered
      setVerificationStatus(userData[1]); // faceId

      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao verificar status:", error);
      setIsLoading(false);
    }
  };

  const startVerification = async () => {
    if (!isRegistered) {
      alert("Você precisa estar cadastrado para iniciar a verificação");
      return;
    }

    try {
      const response = await fetch(`${VERIFF_API_URL}/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-AUTH-CLIENT": VERIFF_API_KEY,
        },
        body: JSON.stringify({
          verification: {
            callback: `https://metamask.app.link/dapp/dol.global`,
            person: {
              firstName: " ",
              lastName: " ",
            },
            vendorData: userWallet,
          },
        }),
      });

      const data = await response.json();

      if (data.verification && data.verification.url) {
        // Redirecionar para a URL da Veriff em uma nova aba
        window.open(data.verification.url, "_blank");
      }
    } catch (error) {
      console.error("Erro ao iniciar verificação:", error);
    }
  };

  if (!userWallet) return null;

  return (
    <div className="space-y-6">
      {/* Status de Verificação */}
      <div className="text-center space-y-2">
        <div className="text-sm text-white/60">Status de Verificação</div>
        <div className="relative group">
          <div className="px-4 py-3 bg-[#000c2a] rounded-xl border border-[#00ffff20] group-hover:border-[#00ffff40] transition-all duration-300">
            {isLoading ? (
              <span className="text-white/60">Carregando...</span>
            ) : !isRegistered ? (
              <div className="flex items-center justify-center space-x-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>Não Cadastrado</span>
              </div>
            ) : verificationStatus ? (
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <Shield className="w-5 h-5" />
                <span>Verificado</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2 text-yellow-400">
                <AlertCircle className="w-5 h-5" />
                <span>Não Verificado</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botão de Verificação */}
      {isRegistered && !verificationStatus && !isLoading && (
        <button onClick={startVerification} className="w-full relative group">
          <div className="relative px-6 py-3 flex items-center justify-center space-x-3 border border-[#00ffff20] rounded-xl group-hover:border-[#00ffff40] transition-all duration-300">
            <Shield className="w-5 h-5 text-[#00ffff]" />
            <span className="text-[#00ffff] font-medium">
              Iniciar Verificação
            </span>
          </div>
        </button>
      )}
    </div>
  );
};

export default VerificationSection;
