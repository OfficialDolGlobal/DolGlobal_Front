import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Loader2 } from "lucide-react";
import USDT_ABI from "../../abis/usdt.abi.json";
import TREASURY_ABI from "../../abis/treasury.abi.json";
import { allowanceUsdt, approveUsdt, balanceUsdt, getProvider } from "../../services/Web3Services";
import { useNotification } from "../modals/useNotification";

const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS;
const USDT_ADDRESS = import.meta.env.VITE_USDT_TOKEN_ADDRESS;

const ContributionModal = ({ isOpen, onClose }) => {
  const showNotification = useNotification();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState("0");
  const [allowance, setAllowance] = useState("0");

  useEffect(() => {
    const checkBalanceAndAllowance = async () => {
      try {
        const provider = await getProvider();
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();


        const userBalance = await balanceUsdt(userAddress);
        const formattedBalance = ethers.formatUnits(userBalance, 6);
        setBalance(formattedBalance);

        const allowance = await allowanceUsdt(
          userAddress,
          TREASURY_ADDRESS
        );
        
        setAllowance(allowance);
      } catch (err) {
        console.error("Error checking balance/allowance:", err);
      }
    };

    if (isOpen) {
      checkBalanceAndAllowance();
    }
  }, [isOpen, amount]);


  const handleApprove = async () => {
    if (!amount || Number(amount) < 10) {
      setError("O valor mínimo é 10 USDT");
      return;
    }

    setLoading(true);
    setError("");

    try {

      const approveAmount = ethers.parseUnits(amount, 6);

      await approveUsdt(TREASURY_ADDRESS, approveAmount);

      setAllowance(ethers.parseUnits(String(approveAmount), 6));
      showNotification("Aprovação de saldo realizada!", "success");
    } catch (error) {
      console.error("Erro na aprovação:", error);
      if (error.message.includes("User not verified")) {
        showNotification("Verifique sua identificação!", "error");
      } else {
        showNotification("Erro desconhecido, tente novamente!", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const treasuryContract = new ethers.Contract(
        TREASURY_ADDRESS,
        TREASURY_ABI,
        signer
      );

      const contributeAmount = ethers.parseUnits(amount, 6);
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      const balance = await usdtContract.balanceOf(await signer.getAddress());

      if (balance < contributeAmount) {
        setError("Saldo USDT insuficiente");
        return;
      }
      const gasLimit = await treasuryContract.contribute.estimateGas(
        contributeAmount
      );

      const tx = await treasuryContract.contribute(contributeAmount, {
        gasLimit: gasLimit + BigInt(50000), // Add buffer
      });

      const receipt = await tx.wait();
      if (receipt.status === 0) {
        throw new Error("Transação falhou");
      }
      const allowance = await allowanceUsdt(
        await signer.getAddress(),
        TREASURY_ADDRESS
      );
      setAllowance(allowance);
      onClose();
      showNotification("Contribuição realizada com sucesso!", "success")
    } catch (err) {
      if (err.code === "ACTION_REJECTED") {
        setError("Transação rejeitada pelo usuário");
      } else if (error.message.includes("User not verified")) {
        showNotification("Verifique sua identificação!", "error");
      } else if (error.message.includes("Already claimed")) {
        showNotification(
          "O Claim deste contrato já foi realizado com sucesso!",
          "info"
        );
      } else if (err.message.includes("execution reverted")) {
        showNotification(
          "Erro na execução do contrato. Verifique se há saldo suficiente.",
          "error"
        );
      } else {
        showNotification(
          "Erro ao fazer contribuição. Tente novamente.",
          "error"
        );
      }
      console.error("Contribution error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#001242]/95 rounded-xl sm:p-6 p-4 w-full max-w-lg mx-4 relative">
        {/* Logo */}
        <div className="absolute -top-8 sm:-top-12 left-1/2 transform -translate-x-1/2">
          <div className="relative h-16 w-16 sm:w-24 sm:h-24">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00ffff40] to-[#0057ff40] rounded-xl blur-xl" />
            <div className="relative w-full h-full bg-[#001242] rounded-xl border-2 border-[#00ffff40] flex items-center justify-center transform rotate-45">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwZmZmZjEwIiBvcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30 rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#00ffff20] to-transparent" />
              <span className="sm:text-2xl text-xl font-bold text-[#00ffff] transform -rotate-45">
                DOL
              </span>
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-4 bg-gradient-to-t from-[#00ffff20] to-transparent blur-lg" />
          </div>
        </div>

        <div className="sm:mt-14 mt-12 sm:space-y-6 space-y-5">
          <h2 className="text-xl font-bold text-[#00ffff] text-center">
            Nova Contribuição
          </h2>

          {/* Progress Steps */}
          <div className="flex justify-center items-center gap-3 mb-4 sm:gap-4 sm:mb-6">
            <div
              className={`w-3 h-3 rounded-full ${
                allowance >=
                (amount
                  ? ethers.parseUnits(amount, 6)
                  : ethers.parseUnits("0", 6))
                  ? "bg-[#00ffff]"
                  : "bg-[#00ffff40]"
              }`}
            />
            <div
              className={`w-12 h-0.5 ${
                allowance >=
                (amount
                  ? ethers.parseUnits(amount, 6)
                  : ethers.parseUnits("0", 6))
                  ? "bg-[#00ffff]"
                  : "bg-[#00ffff40]"
              }`}
            />
            <div
              className={`w-3 h-3 rounded-full 
                 bg-[#00ffff40]
              `}
            />
          </div>



          <div className="sm:p-4 p-3 rounded-lg bg-[#000c2a] border border-[#00ffff20]">
              <p className="text-[#00ffff] font-bold w-full text-center">USDT {Number(balance).toLocaleString()}</p>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-white/80">Valor da Contribuição</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => {

                  setAmount(e.target.value);
                }}  
                className="w-full bg-[#000c2a] border border-[#00ffff20] rounded-lg p-3 text-white outline-none focus:border-[#00ffff] pr-16"
                placeholder="10.00"
                min="10"
                disabled={loading}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60">
                USDT
              </span>
            </div>
            <p className="text-sm text-white/60">Mínimo: 10 USDT</p>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-[#00ffff40] text-white/80 hover:bg-[#00ffff10] transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              className={`flex-1 bg-gradient-to-r from-[#00ffff] to-[#0057ff] py-3 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 ${
                loading ? "opacity-50" : ""
              }`}
              onClick={
                allowance <
                (amount
                  ? ethers.parseUnits(amount, 6)
                  : ethers.parseUnits("0", 6))
                  ? handleApprove
                  : handleContribute
              }
              disabled={loading || !amount || Number(amount) < 10}
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {allowance >= ethers.parseUnits("10", 6) && 
              amount >= 10 &&
              allowance >= ethers.parseUnits(amount, 6)
                ? "Confirmar Contribuição"
                : "Aprovar USDT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionModal;
