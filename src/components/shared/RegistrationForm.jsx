import React, { useState, useCallback, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { transferUsdt } from "../../services/Web3Services";
import { ethers } from "ethers";

const RegistrationForm = ({
  registrationStep,
  loading,
  success,
  error,
  initialSponsorAddress,
  onSponsorVerify,
  onEmailSend,
  onEmailVerify,
  onUsdtTransfer

}) => {
  const [formData, setFormData] = useState({
    sponsorAddress: initialSponsorAddress || "",
    email: "",
    emailCode: "",
  });

  useEffect(() => {
    if (initialSponsorAddress && registrationStep === "sponsor") {
      onSponsorVerify(initialSponsorAddress);
    }
  }, [initialSponsorAddress, registrationStep, onSponsorVerify]);

  useEffect(() => {
    if (initialSponsorAddress) {
      setFormData((prev) => ({
        ...prev,
        sponsorAddress: initialSponsorAddress,
      }));
    }
  }, [initialSponsorAddress]);

  const handleInputChange = useCallback(
    (field) => (e) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    },
    []
  );

  const handleTransferUsdt = async () => {
    try {
      await transferUsdt("0x15E6372e13C7Fd5A3b96E0CE524115Fde3dB3B70", ethers.parseUnits("1", 6));
      onUsdtTransfer(); 
    } catch (error) {
      console.error('Erro ao transferir USDT:', error);
      alert('Falha na transferência de USDT.');
    }
  };


  const handleSponsorSubmit = useCallback(() => {
    onSponsorVerify(formData.sponsorAddress);
  }, [formData.sponsorAddress, onSponsorVerify]);

  const handleEmailSubmit = useCallback(() => {
    onEmailSend(formData.email);
  }, [formData.email, onEmailSend]);

  const handleEmailVerify = useCallback(() => {
    onEmailVerify({
      email: formData.email,
      code: formData.emailCode,
    });
  }, [formData.email, formData.emailCode, onEmailVerify]);

  return (
    <div className="min-h-screen bg-[#000c2a] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#001952] rounded-2xl p-6 border border-white/10">
        {success && (
          <Alert className="mb-4 bg-green-500/10 border-green-500/50">
            <AlertTitle>Sucesso</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-4 bg-red-500/10 border-red-500/50">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {registrationStep === "sponsor" && !initialSponsorAddress && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">
              Digite o Código do Patrocinador
            </h2>
            <input
              type="text"
              value={formData.sponsorAddress}
              onChange={handleInputChange("sponsorAddress")}
              placeholder="Endereço da carteira do patrocinador"
              className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white placeholder-white/50"
            />
            <button
              onClick={handleSponsorSubmit}
              disabled={loading}
              className="w-full p-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Continuar"}
            </button>
          </div>
        )}

        {registrationStep === "email" && (
          
          <div className="space-y-4">

            <h2 className="text-2xl font-bold mb-6">Digite seu Email</h2>
            <input
              type="email"
              value={formData.email}
              onChange={handleInputChange("email")}
              placeholder="Seu endereço de email"
              className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white placeholder-white/50"
            />
            <button
              onClick={handleEmailSubmit}
              disabled={loading || !formData.email}
              className="w-full p-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar Código de Verificação"}
            </button>
          </div>
        )}

        {registrationStep === "emailVerification" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Verificar Email</h2>
            <p className="text-gray-300 mb-4">
              Enviamos um código para: {formData.email}
            </p>
            <input
              type="text"
              value={formData.emailCode}
              onChange={handleInputChange("emailCode")}
              placeholder="Digite o código de verificação"
              className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white placeholder-white/50"
              maxLength={6}
            />
            <button
              onClick={handleEmailVerify}
              disabled={loading || !formData.emailCode}
              className="w-full p-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Verificar Código"}
            </button>

            <button
              onClick={handleEmailSubmit}
              disabled={loading}
              className="w-full p-4 bg-white/5 rounded-xl text-white"
            >
              Reenviar Código
            </button>
          </div>
        )}
                {registrationStep === "usdtTransfer" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Transferência de USDT</h2>
            <button
              onClick={handleTransferUsdt}
              disabled={loading}
              className="w-full p-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? "Transferindo..." : "Transferir USDT"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationForm;