import React, { useState } from "react";
import { LogOut, Wallet,  ExternalLink } from "lucide-react";

const Profile = ({ userWallet, setUserWallet, handleDisconnect }) => {
  const [amount, setAmount] = useState(1); 

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleOpenExchange = () => {
    window.open(
      `https://pixpay.com.vc/buy?action=buy&currency=USDT&amount=${amount}&address=${userWallet}&msg=dolglobal`,
      "_blank"
    );
  };

  const disconnectWallet = async () => {
    try {
      setUserWallet(null);
      localStorage.removeItem('userWallet');
      sessionStorage.clear();
      
      if (window.ethereum) {
        await window.ethereum.request({
          method: "eth_requestAccounts",
          params: [{ eth_accounts: {} }],
        });
      }

      window.location.href = '/';
    } catch (error) {
      console.error("Erro ao desconectar:", error);
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        <div className="relative bg-[#001242]/80 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00ffff10] to-[#0057ff10] animate-pulse" />

          <div className="relative sm:p-6 p-4 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="sm:w-20 w-16 h-16 sm:h-20 rounded-full bg-gradient-to-r from-[#00ffff20] to-[#0057ff20] flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-[#00ffff]" />
                </div>

              </div>
            </div>

            <div className="space-y-4">

              <button
                onClick={handleOpenExchange}
                className="w-full group transition-all duration-300"
              >
                <div className="flex items-center justify-between sm:p-4 p-2 bg-[#000c2a] rounded-xl border border-[#00ffff20] hover:border-[#00ffff40]">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <img
                      src="https://pixpay.com.vc/img/logos/logo2.png"
                      alt="PixPay"
                      className="sm:h-12 sm:w-20 h-6 w-12"
                    />
                    <div className="flex ml-4 flex-col text-left">
                      <span className="text-[#00ffff] font-medium">
                        Comprar USDT
                      </span>
                      <span className="text-xs text-white/60 flex items-center gap-1">
                        Abrir no navegador <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                  <span className="text-white/60">→</span>
                </div>
              </button>
              <div className="text-sm text-white/60">Quantidade de usdt para comprar</div>
            <input
                type="number"
                value={amount}
                
                onChange={(e) => {
                  let value = parseFloat(e.target.value);
                  if (value < 1) {
                    value = 1;
                  } else if (!Number.isInteger(value)) {
                    value = Math.floor(value * 10) / 10;
                  }
                  setAmount(value);
                }}                
                className="w-full px-4 py-3 bg-[#000c2a] rounded-xl border border-[#00ffff20] hover:border-[#00ffff40] text-white focus:outline-none"
                placeholder="Min 1"
                min="1"
                step="0.1" 
              />
            </div>

            <div className="text-center space-y-2">
              <div className="text-sm text-white/60">Carteira Conectada</div>
              <div className="relative group">
                <div className="px-4 py-3 bg-[#000c2a] rounded-xl border border-[#00ffff20] group-hover:border-[#00ffff40] transition-all duration-300 overflow-hidden">
                  <span className="text-[#00ffff] font-mono text-sm sm:text-base break-all">
                    {truncateAddress(userWallet)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={disconnectWallet}
              className="w-full relative group"
            >
              <div className="relative sm:px-6 sm:py-3 px-4 py-2 flex items-center justify-center space-x-2 sm:space-x-3 border border-red-500/20 rounded-xl group-hover:border-red-500/40 transition-all duration-300">
                <LogOut className="w-5 h-5 text-red-500" />
                <span className="text-red-500 font-medium">
                  Desconectar Carteira
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
