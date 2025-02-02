import React, { useState, useCallback, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { MapPin } from "lucide-react";

const RegistrationForm = ({
  registrationStep,
  loading,
  success,
  error,
  locationPermission,
  initialSponsorAddress,
  onSponsorVerify,
  onEmailSend,
  onEmailVerify,
  onPhoneSend,
  onPhoneVerify,
}) => {
  const [formData, setFormData] = useState({
    sponsorAddress: initialSponsorAddress || "",
    email: "",
    emailCode: "",
    phone: "",
    phoneCode: "",
  });
  const [showLocationPrompt, setShowLocationPrompt] = useState(
    !locationPermission
  );

  const requestLocationPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: "geolocation" });

      if (result.state === "prompt") {
        navigator.geolocation.getCurrentPosition(
          () => setShowLocationPrompt(false),
          (error) => {
            console.error("Erro ao obter localização:", error);
            setShowLocationPrompt(true);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      } else if (result.state === "granted") {
        setShowLocationPrompt(false);
      }
    } catch (error) {
      console.error("Erro ao verificar permissão:", error);
    }
  };

  useEffect(() => {
    if (!locationPermission) {
      requestLocationPermission();
    }

    if (initialSponsorAddress && registrationStep === "sponsor") {
      onSponsorVerify(initialSponsorAddress);
    }
  }, [
    locationPermission,
    initialSponsorAddress,
    registrationStep,
    onSponsorVerify,
  ]);

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

  const handlePhoneSubmit = useCallback(() => {
    // Remover caracteres especiais do telefone
    const cleanPhone = formData.phone.replace(/\D/g, "");
    onPhoneSend(cleanPhone);
  }, [formData.phone, onPhoneSend]);

  const handlePhoneVerify = useCallback(() => {
    // Remover caracteres especiais do telefone
    const cleanPhone = formData.phone.replace(/\D/g, "");
    onPhoneVerify({
      phone: cleanPhone,
      code: formData.phoneCode,
    });
  }, [formData.phone, formData.phoneCode, onPhoneVerify]);

  // Componente de solicitação de localização
  const LocationPrompt = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-[#001952] p-6 rounded-2xl max-w-md w-full border border-white/10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <MapPin size={32} className="text-blue-400" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">
            Permissão de Localização
          </h3>
          <p className="text-gray-300 text-center">
            Para completar seu registro, precisamos da sua localização. Isso nos
            ajuda a fornecer uma melhor experiência.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={requestLocationPermission}
            className="w-full p-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl text-white font-semibold hover:opacity-90 transition-all"
          >
            Permitir Localização
          </button>

          <button
            onClick={() => setShowLocationPrompt(false)}
            className="w-full p-4 bg-white/5 rounded-xl text-white hover:bg-white/10 transition-all"
          >
            Agora Não
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#000c2a] text-white flex items-center justify-center p-4">
      {showLocationPrompt && <LocationPrompt />}

      <div className="max-w-md w-full bg-[#001952] rounded-2xl p-6 border border-white/10">
        {!locationPermission && !showLocationPrompt && (
          <Alert className="mb-4 bg-yellow-500/10 border-yellow-500/50">
            <AlertTitle>Localização Necessária</AlertTitle>
            <AlertDescription>
              <div className="flex flex-col space-y-2">
                <span>
                  A localização é necessária para completar o registro.
                </span>
                <button
                  onClick={requestLocationPermission}
                  className="text-blue-400 hover:text-blue-300 transition-colors underline text-left"
                >
                  Clique aqui para ativar
                </button>
              </div>
            </AlertDescription>
          </Alert>
        )}

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

        {registrationStep === "phone" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Digite seu Telefone</h2>
            <input
              type="tel"
              value={formData.phone}
              onChange={handleInputChange("phone")}
              placeholder="Número de telefone (ex: 5511999999999)"
              className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white placeholder-white/50"
              maxLength={13}
            />
            <button
              onClick={handlePhoneSubmit}
              disabled={loading || formData.phone.length < 13}
              className="w-full p-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar Código de Verificação"}
            </button>
          </div>
        )}

        {registrationStep === "phoneVerification" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">
              Verificar Número de Telefone
            </h2>
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
              disabled={loading || !formData.phoneCode}
              className="w-full p-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Verificar Código"}
            </button>
            <button
              onClick={handlePhoneSubmit}
              disabled={loading}
              className="w-full p-4 bg-white/5 rounded-xl text-white"
            >
              Reenviar Código
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationForm;
