import React, { useState, useEffect } from "react";
import { Shield, AlertCircle } from "lucide-react";
import { getUser } from "../../services/Web3Services";


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


      const userData = await getUser(userWallet);


      setIsRegistered(userData[0]); // registered
      setVerificationStatus(userData[1]); // faceId

      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao verificar status:", error);
      setIsLoading(false);
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
            ):""}
          </div>
        </div>
      </div>


    </div>
  );
};

export default VerificationSection;
