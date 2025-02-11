import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Loader2 } from "lucide-react";
import TREASURY_ABI from "../../abis/treasury.abi.json";
import { getProvider, contractClaim } from "../../services/Web3Services";
import { useNotification } from "../modals/useNotification";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS;
const MAX_RETRIES = 5;
const RETRY_DELAY = 4000; // 2 segundos

const ContractCard = ({ contract, onClaim, formatNumber, isFinished = false }) => {
  const [timeLeft, setTimeLeft] = useState(contract.timeUntilNext);

  useEffect(() => {
    if (isFinished) return;

    setTimeLeft(contract.timeUntilNext);
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [contract.timeUntilNext, isFinished]);

  const TimeDisplay = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="bg-[#001242] w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center border border-[#00ffff30]">
        <span className="text-2xl font-bold text-[#00ffff]">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-gray-400 text-sm mt-1">{label}</span>
    </div>
  );

  return (
    <div className={`bg-[#001242]/80 backdrop-blur-xl rounded-xl p-4 sm:p-6 border ${isFinished ? 'border-gray-500/20' : 'border-[#00ffff20]'}`}>
      <div className={`grid ${isFinished ? 'grid-cols-1' :'grid-cols-1  lg:grid-cols-2 '} gap-6`}>
        <div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className={`text-3xl font-bold ${isFinished ? 'text-gray-400' : 'text-[#00ffff]'}`}>
                {formatNumber(contract.investment)} {contract.invested}
              </h3>
              <p className="text-white/60">
                Retorno Total: 250% ({formatNumber(contract.totalReturn)} {contract.invested})
              </p>
            </div>
            {isFinished && (
              <span className="px-3 py-1 bg-gray-700/50 rounded-full text-sm text-gray-300">
                Finalizado
              </span>
            )}
          </div>

          <div className="h-2 bg-[#000c2a] rounded-full mb-6">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFinished ? 'bg-gray-500' : 'bg-gradient-to-r from-[#00ffff] to-[#0057ff]'
              }`}
              style={{
                width: `${(Number(contract.totalPaid) / Number(contract.totalReturn)) * 100}%`,
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

        {!isFinished && (
          <div className="flex flex-col justify-between border-l border-[#00ffff20] pl-3 sm:pl-6">
            <div>
              <div className="text-xl text-right mb-2">Próximo Saque</div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#00ffff]">
                  {formatNumber(contract.nextClaimUs)} USDT
                </p>

              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-center gap-2 sm:gap-4 mb-6">
                <TimeDisplay value={Math.floor(timeLeft / 3600)} label="h" />
                <div className="text-[#00ffff] text-xl relative bottom-3 sm:text-2xl font-bold self-center">:</div>
                <TimeDisplay value={Math.floor((timeLeft % 3600) / 60)} label="m" />
                <div className="text-[#00ffff] text-xl relative bottom-3 sm:text-2xl font-bold self-center">:</div>
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
        )}
      </div>
    </div>
  );
};

const Contribute = () => {
  const showNotification = useNotification();
  const [activeContracts, setActiveContracts] = useState([]);
  const [inactiveContracts, setInactiveContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [showInactive, setShowInactive] = useState(false);

  const handleClaim = async (index) => {
    try {
      const provider = await getProvider();
      if (!provider) {
        throw new Error("Carteira não conectada");
      }

      await contractClaim(index);
      showNotification("Claim realizado com sucesso!", "success");
      loadContracts(); // Recarrega os contratos após o claim
    } catch (error) {
      console.error("Erro no claim:", error);
      if (error.message.includes("User not verified")) {
        showNotification("Verifique sua identificação!", "error");
      } else if (error.message.includes("Already claimed")) {
        showNotification("O Claim deste contrato já foi realizado com sucesso!", "info");
      } else if (error.message.includes("Tokens are still locked")) {
        showNotification("Aguarde o tempo mínimo entre os claims!", "warning");
      } else if (error.message.includes("Minimum accumulated")) {
        showNotification("Valor mínimo para claim não atingido!", "warning");
      } else if (error.message.includes("Invalid index")) {
        showNotification("Contrato inválido!", "error");
      } else if (error.message.includes("Insufficient token balance")) {
        showNotification("Saldo insuficiente no contrato!", "error");
      } else {
        showNotification("Falha no Claim, tente novamente!", "error");
      }
    }
  };

  const loadContracts = async (retryAttempt = 0) => {
    try {
      const provider = await getProvider();
      if (!provider) {
        throw new Error("Carteira não conectada");
      }

      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const treasury = new ethers.Contract(TREASURY_ADDRESS, TREASURY_ABI, provider);

      // Carrega contratos ativos
      const activeContractsData = await treasury.getActiveContributions(userAddress, ethers.getBigInt(1));
      const inactiveContractsData = await treasury.getInactiveContributions(userAddress, ethers.getBigInt(1));

      const claimPeriod = 24 * 60 * 60;

      const processContract = async (contract) => {
        try {
          const contractId = ethers.getBigInt(contract.id);
          const nextClaim = await treasury.previewClaim(userAddress, contractId);
          const timeUntilNext = contract.daysPaid < 150 ? 
            await treasury.timeUntilNextWithdrawal(userAddress, contractId) : 0;
          const dailyReturn = ethers.formatUnits(contract.balance / BigInt(150), 6);
          
          return {
            id: Number(contract.id),
            investment: ethers.formatUnits(contract.deposit, 6),
            invested: "USDT",
            startDate: new Date(Number(contract.startedTimestamp) * 1000),
            endDate: new Date((Number(contract.startedTimestamp) + 150 * claimPeriod) * 1000),
            dailyReturn: dailyReturn,
            remainingDays: 150 - Number(contract.daysPaid),
            totalPaid: Number(dailyReturn) * Number(contract.daysPaid),
            totalReturn: ethers.formatUnits(contract.balance, 6),
            nextClaimUs: ethers.formatUnits(nextClaim[0], 6),
            timeUntilNext: Number(timeUntilNext),
            claims: contract.claims,
            claimPrice: contract.claimPrice,
            claimsTimestamp: contract.claimsTimestamp
          };
        } catch (error) {
          console.error(`Erro ao processar contrato ${contract.id}:`, error);
          return null;
        }
      };

      const processedActive = await Promise.all(
        activeContractsData.map(processContract)
      );
      const processedInactive = await Promise.all(
        inactiveContractsData.map(processContract)
      );

      // Filtra contratos que falharam no processamento
      setActiveContracts(processedActive.filter(Boolean));
      setInactiveContracts(processedInactive.filter(Boolean));
      setError("");
      setLoading(false);
      setRetryCount(0);

    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
      
      if (retryAttempt < MAX_RETRIES) {
        setError(`Tentativa ${retryAttempt + 1} de ${MAX_RETRIES} - Reconectando...`);
        setTimeout(() => {
          loadContracts(retryAttempt + 1);
        }, RETRY_DELAY);
      } else {
        setError('Não foi possível carregar os contratos. Por favor, verifique sua conexão e tente novamente.');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const formatNumber = (num) =>
    Number(num).toLocaleString("pt-BR", { maximumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-[#00ffff] mb-4"></div>
        {error && <div className="text-white/60 text-center">{error}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#00ffff]">Seus Contratos</h2>
        <button
          onClick={() => setShowInactive(!showInactive)}
          className="text-white/60 hover:text-white transition-colors"
        >
          {showInactive ? "Mostrar Ativos" : "Mostrar Finalizados"}
        </button>
      </div>

      {error && (
        <Alert className="mb-4 bg-red-500/10 border-red-500/50">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 pb-20">
        {showInactive ? (
          <>
            {inactiveContracts.length > 0 ? (
              inactiveContracts.map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  formatNumber={formatNumber}
                  isFinished={true}
                />
              ))
            ) : (
              <div className="text-center text-white/60 py-8">
                Você não possui contratos finalizados.
              </div>
            )}
          </>
        ) : (
          <>
            {activeContracts.length > 0 ? (
              activeContracts.map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  onClaim={handleClaim}
                  formatNumber={formatNumber}
                />
              ))
            ) : (
              <div className="text-center text-white/60 py-8">
                Você não possui contratos ativos. Comece fazendo uma contribuição!
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Contribute;