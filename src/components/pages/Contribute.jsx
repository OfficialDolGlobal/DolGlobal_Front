import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Loader2 } from "lucide-react";
import TREASURY_ABI from "../../abis/treasury.abi.json";
import { getProvider, contractClaim } from "../../services/Web3Services";
import { useNotification } from "../modals/useNotification";

const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS;

const ContractCard = ({ contract, onClaim, formatNumber }) => {
  const [timeLeft, setTimeLeft] = useState(contract.timeUntilNext);

  useEffect(() => {
    setTimeLeft(contract.timeUntilNext);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [contract.timeUntilNext]);

  const TimeDisplay = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="bg-[#001242] w-16 h-16 rounded-lg flex items-center justify-center border border-[#00ffff30]">
        <span className="text-2xl font-bold text-[#00ffff]">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-gray-400 text-sm mt-1">{label}</span>
    </div>
  );

  return (
    <div className="bg-[#001242]/80 backdrop-blur-xl rounded-xl p-6 border border-[#00ffff20]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-3xl font-bold text-[#00ffff]">
                {formatNumber(contract.investment)} {contract.invested}
              </h3>
              <p className="text-white/60">
                Retorno Total: 250% ({formatNumber(contract.totalReturn)}{" "}
                {contract.invested})
              </p>
            </div>
          </div>

          <div className="h-2 bg-[#000c2a] rounded-full mb-6">
            <div
              className="h-full bg-gradient-to-r from-[#00ffff] to-[#0057ff] rounded-full transition-all duration-300"
              style={{
                width: `${
                  (Number(contract.totalPaid) / Number(contract.totalReturn)) *
                  100
                }%`,
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-white/60 mb-1">Início</div>
              <div className="text-white font-medium">
                {contract.startDate.toLocaleDateString("pt-BR")}
              </div>
            </div>
            <div>
              <div className="text-white/60 mb-1">Término</div>
              <div className="text-white font-medium">
                {contract.endDate.toLocaleDateString("pt-BR")}
              </div>
            </div>
            <div>
              <div className="text-white/60 mb-1">Total Pago</div>
              <div className="text-white font-medium">
                {formatNumber(contract.totalPaid)} USDT
              </div>
            </div>
            <div>
              <div className="text-white/60 mb-1">Dias Restantes</div>
              <div className="text-white font-medium">
                {contract.remainingDays}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between border-l border-[#00ffff20] pl-6">
          <div>
            <div className="text-xl text-right mb-2">Próximo Saque</div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#00ffff]">
                {formatNumber(contract.nextClaimUs)} USDT
              </p>
              <p className="text-xl text-[#00ffff]">
                {formatNumber(contract.nextClaimDol)} DOL
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-center gap-4 mb-6">
              <TimeDisplay value={Math.floor(timeLeft / 3600)} label="h" />
              <div className="text-[#00ffff] text-2xl font-bold self-center">
                :
              </div>
              <TimeDisplay
                value={Math.floor((timeLeft % 3600) / 60)}
                label="m"
              />
              <div className="text-[#00ffff] text-2xl font-bold self-center">
                :
              </div>
              <TimeDisplay value={timeLeft % 60} label="s" />
            </div>

            <button
              onClick={() => onClaim(contract.id)}
              disabled={timeLeft > 0}
              className="w-full relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 p-[1px] transition-all duration-300 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="rounded-lg bg-gray-950/50 px-6 py-3 backdrop-blur-sm">
                <span className="font-bold text-white">
                  {timeLeft > 0 ? "Aguarde" : "Claim"}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Contribute = () => {
  const showNotification = useNotification();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleClaim = async (index) => {
    try {
      await contractClaim(index);
      showNotification("Claim realizado com sucesso!", "success");
    } catch (error) {
      console.error("Erro no claim:", error);
      if (error.message.includes("User not verified")) {
        showNotification("Verifique sua identificação!", "error");
      } else if (error.message.includes("Already claimed")){
        showNotification("O Claim deste contrato já foi realizado com sucesso!", "info");
      } else {
        showNotification("Falha no Claim, tente novamente!", "error");
      }
    }
  };

  const getNextClaimTime = (startDate, daysPaid) => {
    const start = new Date(startDate);
    const now = new Date();
    const nextClaimDate = new Date(
      start.getTime() + (daysPaid + 1) * 24 * 60 * 60 * 1000
    );

    if (nextClaimDate <= now) {
      return 0;
    }

    return Math.floor((nextClaimDate - now) / 1000);
  };

  const loadContracts = async () => {
    try {
      setError('');

      const provider = await getProvider();
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      const treasury = new ethers.Contract(TREASURY_ADDRESS, TREASURY_ABI, provider);

      const activeContracts = await treasury.getActiveContributions(userAddress, ethers.getBigInt(1));
      if (!activeContracts || activeContracts.length === 0) {
        setContracts([]);
        setLoading(false);
        return;
      }

      const claimPeriod = 24*60*60;

      const contractsWithDetails = await Promise.all(
        activeContracts.map(async (contract) => {
          const contractId = ethers.getBigInt(contract.id);
          const nextClaim = await treasury.previewClaim(userAddress, contractId);
          const timeUntilNext = await treasury.timeUntilNextWithdrawal(userAddress, contractId);
          const dailyReturn = ethers.formatUnits(contract.balance / BigInt(150), 6);
          return {
            id: Number(contract.id),
            investment: ethers.formatUnits(contract.deposit, 6),
            invested: "USDT",
            startDate: new Date(Number(contract.startedTimestamp) * 1000),
            endDate: new Date((Number(contract.startedTimestamp) + 150 * claimPeriod) * 1000),
            dailyReturn: dailyReturn,
            remainingDays: 150 - Number(contract.daysPaid),
            totalPaid: Number(dailyReturn)*Number(contract.daysPaid),
            totalReturn: ethers.formatUnits(contract.balance, 6),
            nextClaimUs: ethers.formatUnits(nextClaim[0], 6),
            nextClaimDol: ethers.formatUnits(nextClaim[1], 18),

            timeUntilNext: Number(timeUntilNext),
          };
        })
      );

      setContracts(contractsWithDetails);
      setLoading(false);
    } catch (err) {
      console.error('Error loading contracts:', err);
      setError('Erro ao carregar contratos');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
    const interval = setInterval(loadContracts, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-[#00ffff]"></div>
      </div>
    );
  }

  const formatNumber = (num) =>
    Number(num).toLocaleString("pt-BR", { maximumFractionDigits: 2 });

  return (
    <div className="flex flex-col p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#00ffff]">Seus Contratos</h2>
      </div>

      {error && <div className="text-red-500 text-center py-2">{error}</div>}

      <div className="grid gap-6 pb-20">
        {contracts.map((contract) => (
          <ContractCard
            key={contract.id}
            contract={contract}
            onClaim={handleClaim}
            formatNumber={formatNumber}
          />
        ))}

        {contracts.length === 0 && (
          <div className="text-center text-white/60 py-8">
            Você não possui contratos ativos. Comece fazendo uma contribuição!
          </div>
        )}
      </div>
    </div>
  );
};

export default Contribute;
