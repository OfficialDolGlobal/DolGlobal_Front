import React from "react";
import { LogOut, Wallet, CircleDot, ExternalLink } from "lucide-react";

const Profile = ({ userWallet, setUserWallet, handleDisconnect }) => {
  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleOpenExchange = () => {
    window.open(
      "https://ramp.alchemypay.org/?type=offRamp&crypto=USDT&network=MATIC&fiat=BRL",
      "_blank"
    );
  };

  const disconnectWallet = async () => {
    try {
      // Limpa estado local
      setUserWallet(null);
      localStorage.removeItem('userWallet');
      sessionStorage.clear();
      
      // Desconecta do MetaMask
      if (window.ethereum) {
        await window.ethereum.request({
          method: "eth_requestAccounts",
          params: [{ eth_accounts: {} }],
        });
      }

      // Recarrega a página para limpar todos os estados
      window.location.href = '/';
    } catch (error) {
      console.error("Erro ao desconectar:", error);
      // Força desconexão mesmo com erro
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        {/* Card Principal */}
        <div className="relative bg-[#001242]/80 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00ffff10] to-[#0057ff10] animate-pulse" />

          {/* Conteúdo */}
          <div className="relative p-6 space-y-6">
            {/* Header com Avatar */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#00ffff20] to-[#0057ff20] flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-[#00ffff]" />
                </div>
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#001242] p-1">
                  <CircleDot className="w-full h-full text-[#00ffff]" />
                </div>
              </div>
            </div>

            {/* Box Compra/Venda USDT */}
            <button
              onClick={handleOpenExchange}
              className="w-full group transition-all duration-300"
            >
              <div className="flex items-center justify-between p-4 bg-[#000c2a] rounded-xl border border-[#00ffff20] hover:border-[#00ffff40]">
                <div className="flex items-center space-x-3">
                  <img
                    src="https://s3-eu-west-1.amazonaws.com/tpd/logos/62d7dd0b326019737dcbc711/0x0.png"
                    alt="AlchemyPay"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-[#00ffff] font-medium">
                      Comprar/Vender USDT
                    </span>
                    <span className="text-xs text-white/60 flex items-center gap-1">
                      Abrir no navegador <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
                <span className="text-white/60">→</span>
              </div>
            </button>

            {/* Informações da Carteira */}
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


            {/* Botão de Logout */}
            <button
              onClick={disconnectWallet}
              className="w-full relative group"
            >
              <div className="relative px-6 py-3 flex items-center justify-center space-x-3 border border-red-500/20 rounded-xl group-hover:border-red-500/40 transition-all duration-300">
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