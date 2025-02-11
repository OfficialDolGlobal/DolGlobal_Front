import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { checkBlacklist, getSignature } from "../../services/Web3Services";

const SignMessage = ({ isOpen, setIsOpen, userAddress }) => {
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState(null);
  const [signature, setSignature] = useState(null);

  const requestSignature = async () => {
    try {
      setIsSigning(true);
      setError(null);

      const signedMessage = await getSignature(
        "Dol Global - The most innovative crypto DAO!"
      );

      if (signedMessage) {
        Cookies.set(userAddress, signedMessage, { expires: 1000 });
        setSignature(signedMessage); // Atualiza o estado com a assinatura
      }


      await checkBlacklist(userAddress,Cookies.get("user_wallet"),signedMessage)
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSigning(false);
    }
  };

  useEffect(() => {
    if (signature) {
      setIsOpen(false);
    }
  }, [signature, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#001242]/95 rounded-xl p-6 w-full max-w-lg mx-4 relative">
        <h2 className="text-lg font-semibold">Autenticação necessária</h2>
        <p className="mt-2">Você precisa assinar uma mensagem para continuar.</p>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <button
          onClick={requestSignature}
          className={`mt-4 px-4 py-2 text-white ${
            isSigning ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
          } rounded`}
          disabled={isSigning}
        >
          {isSigning ? "Assinando..." : "Assinar"}
        </button>
      </div>
    </div>
  );
};

export default SignMessage;
