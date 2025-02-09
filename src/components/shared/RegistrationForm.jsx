import React, { useState, useCallback, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { transferUsdt,balanceUsdt, getSignature } from "../../services/Web3Services";
import { ethers } from "ethers";
import Cookies from 'js-cookie';


const RegistrationForm = ({
  registrationStep,
  loading,
  success,
  emailLoading,
  phoneLoading,
  emailLoadingVerify,
  phoneLoadingVerify,
  error,
  initialSponsorAddress,
  onSponsorVerify,
  onEmailSend,
  onEmailVerify,
  onPhoneVerify,
  onPhoneSend,
  onUsdtTransfer,
  phone,
  email,
  onEmailSendCode,
  onPhoneSendCode,
  userAddress

}) => {
  const [formData, setFormData] = useState({
    sponsorAddress: initialSponsorAddress || "",
    email: email||"",
    phone: phone ||"",
    emailCode: "",
    phoneCode:"",
    usdtBalance:"0"
  });
  const [emailCodeTimer, setEmailCodeTimer] = useState(0);
  const [phoneCodeTimer, setPhoneCodeTimer] = useState(0);

  useEffect(() => {
    if (userAddress) {
      fetchUsdtBalance();
    }
  }, [userAddress]);

  const fetchUsdtBalance = async () => {
    try {
      const balance = await balanceUsdt(userAddress);
      setFormData((prev) => ({
        ...prev,
        usdtBalance: ethers.formatUnits(balance, 6) 
      }));
    } catch (error) {
      console.error('Failed to fetch USDT balance:', error);
    }
  };

  useEffect(() => {
    let interval;
    if (emailCodeTimer > 0) {
      interval = setInterval(() => {
        setEmailCodeTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailCodeTimer]);

  useEffect(() => {
    let interval;
    if (phoneCodeTimer > 0) {
      interval = setInterval(() => {
        setPhoneCodeTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phoneCodeTimer]);

  const handleEmailSendCodeClick = () => {
    if (emailCodeTimer === 0) {
      onEmailSendCode(formData.email);
      setEmailCodeTimer(60); // Reset timer to 60 seconds
    }
  };
  const handlePhoneSendCodeClick = () => {
    if (phoneCodeTimer === 0) {
      onPhoneSendCode(formData.phone);
      setPhoneCodeTimer(60); // Reset timer to 60 seconds
    }
  };


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
      
      onUsdtTransfer(); 

    } catch (error) {
      console.error('Erro ao transferir USDT:', error);
    }
  };


  const handleSponsorSubmit = useCallback(() => {
    onSponsorVerify(formData.sponsorAddress);
  }, [formData.sponsorAddress, onSponsorVerify]);

  const handleEmailSubmit = useCallback(() => {
    onEmailSend(formData.email);
  }, [formData.email, onEmailSend]);
  const handleEmailSendCode = useCallback(() => {

    onEmailSendCode(formData.email);
  }, [formData.email, onEmailSendCode]);

  const handlePhoneSubmit = useCallback(() => {
    onPhoneSend(formData.phone);
  }, [formData.phone, onPhoneSend]);

  const handleEmailVerify = useCallback(() => {
    onEmailVerify({
      email: formData.email,
      code: formData.emailCode,
    });
  }, [formData.email, formData.emailCode, onEmailVerify]);
  const handlePhoneVerify = useCallback(() => {
    onPhoneVerify({
      phone: formData.phone,
      code: formData.phoneCode,
    });
  }, [formData.phone, formData.phoneCode, onPhoneVerify]);
  const handlePhoneSendCode = useCallback(() => {
    onPhoneSendCode(formData.phone);
  }, [formData.phone, onPhoneSendCode]);

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
              {loading ? "Cadastrando..." : "Cadastrar email"}
            </button>
          </div>
        )}
        {registrationStep === "phone" && (
          
          <div className="space-y-4">

            <h2 className="text-2xl font-bold mb-6">Digite seu Telefone</h2>
            <input
              type="text"
              value={formData.phone}
              onChange={handleInputChange("phone")}
              placeholder="Seu telefone"
              className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white placeholder-white/50"
            />
            <button
              onClick={handlePhoneSubmit}
              disabled={loading || !formData.phone}
              className="w-full p-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? "Cadastrando..." : "Cadastrar telefone"}
            </button>
          </div>
        )}
{registrationStep === "verifyCode" && (
  <>

{email ? (
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
          disabled={emailLoadingVerify || !formData.emailCode}
          className="w-full p-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl font-semibold disabled:opacity-50"
        >
          {emailLoadingVerify ? "Verificando..." : "Verificar Código"}
        </button>

        <button
        onClick={handleEmailSendCodeClick}
        disabled={emailLoading || emailCodeTimer > 0}
        className="w-full p-4 bg-white/5 rounded-xl text-white"
      >
        {emailLoading ? "Enviando..." : emailCodeTimer > 0 ? `Reenviar em ${emailCodeTimer}s` : "Enviar Código"}
      </button>

      </div>
    ):"Email sucessfuly verified"}

    {phone ? (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-6">Verificar Telefone</h2>
        <p className="text-gray-300 mb-4">
          Enviamos um código para: {formData.phone}
        </p>
        <input
          type="text"
          value={formData.phoneCode}
          onChange={handleInputChange("phoneCode")}
          placeholder="Digite o código de verificação"
          className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white placeholder-white/50"
          maxLength={6}
        />
         <button
          onClick={handlePhoneVerify}
          disabled={phoneLoadingVerify || !formData.phoneCode}
          className="w-full p-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl font-semibold disabled:opacity-50"
        >
          {phoneLoadingVerify ? "Verificando..." : "Verificar Código"}
        </button>

        <button
        onClick={handlePhoneSendCodeClick}
        disabled={phoneLoading || phoneCodeTimer > 0}
        className="w-full p-4 bg-white/5 rounded-xl text-white"
      >
        {phoneLoading ? "Enviando..." : phoneCodeTimer > 0 ? `Reenviar em ${phoneCodeTimer}s` : "Enviar Código"}
      </button>
      </div>
    ):"Phone already verified"}
  </>
)}


                {registrationStep === "usdtTransfer" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Transferência de USDT</h2>
            <p>É necessário transferir 1 USDT para realizar o cadastro</p>
            <p>Balance: {formData.usdtBalance} USDT</p>
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