import React, { useState, useEffect } from "react";
import { Clock, Users, Wallet } from "lucide-react";
import { ethers, verifyMessage } from "ethers";
import CONTRACT_ABI from "../../abis/user.abi.json";
import { useNotification } from "../modals/useNotification";
import {
  getTotalEarnedPerDay,
  getUserTotalInvestment,
  getNextContributionToClaim,
  getTimeUntilClaim,
  previewValueToClaim,
  contractClaim,
  checkBlacklist,
  getUserIp,
  getUserLocation,
  addLogs,
  isValidSignature,
} from "../../services/Web3Services";
import Cookies from 'js-cookie';
import { isMobile, osName, mobileModel } from 'react-device-detect';
import SignMessage from "../modals/SignMessage";




const StatCard = ({ title, value, icon }) => (
  <div className="bg-gradient-to-br from-[#001242]/90 to-[#001242]/70 sm:p-5 p-2 rounded-xl border border-[#00ffff20] backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]">
    <div className="flex items-center sm:gap-4 gap-2">
      <div className="p-3 bg-[#00ffff20] rounded-lg mb-0">{icon}</div>
      <div className="text-left">
        <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
        <p className="text-white sm:text-lg text-sm font-bold">{value}</p>
      </div>
    </div>
  </div>
);

const CountdownDisplay = ({ seconds }) => {
  const formatTime = (time) => String(time).padStart(2, "0");

  if (typeof seconds !== "number" || seconds < 0 || !Number.isFinite(seconds)) {
    return (
      <div className="text-red-500 text-center font-semibold my-4">
        Erro: Valor inválido fornecido para o tempo restante.
      </div>
    );
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const TimeBox = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="bg-[#001242] w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center border border-[#00ffff30]">
        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#00ffff] to-[#0057ff] bg-clip-text text-transparent">
          {value}
        </span>
      </div>
      <span className="text-gray-400 text-sm mt-2">{label}</span>
    </div>
  );

  return (
    <div className="flex justify-center gap-3 sm:gap-4 my-6">
      <TimeBox value={formatTime(hours)} label="Horas" />
      <div className="text-[#00ffff] text-2xl font-bold self-start mt-6">:</div>
      <TimeBox value={formatTime(minutes)} label="Minutos" />
      <div className="text-[#00ffff] text-2xl font-bold self-start mt-6">:</div>
      <TimeBox value={formatTime(secs)} label="Segundos" />
    </div>
  );
};

const Home = ({ contractAddress, userData, setActivePage }) => {
  const showNotification = useNotification();

  const [contractStats, setContractStats] = useState({
    userAddress: "",
    totalInvestment: "0",
    dailyYieldUs: "0",
    networkEarnings: "0",
    unilevelDaily: "0",
    timeWithdrawNextClaim: "0",
    valueUsNextClaim: "0",
    nextContribution: {
      id: 0,
      deposit: 0,
      balance: 0,
      startedTimestamp: 0,
      lastClaimTimestamp: 0,
      daysPaid: 0,
      claimsTimestamp: [],
      claims: [],
    },
  });
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (contractStats.timeWithdrawNextClaim > 0) {
      setSeconds(contractStats.timeWithdrawNextClaim);
    }
  }, [contractStats.timeWithdrawNextClaim]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 0) {
          clearInterval(interval);
          return 0;
        }
        return Number(prevSeconds) - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);


  const handleClaim = async (index) => {
    try {
      await contractClaim(index);

      showNotification("Claim realizado com sucesso!", "success");
      const nextContribution = await getNextContributionToClaim(
        contractStats.userAddress,
        1
      );
      const timeWithdrawNextClaim = await getTimeUntilClaim(
        contractStats.userAddress,
        nextContribution[0]
      );
      const valueToClaim = await previewValueToClaim(
        contractStats.userAddress,
        nextContribution[0]
      );

      setContractStats((prevStats) => ({
        ...prevStats,
        nextContribution: nextContribution,
        timeWithdrawNextClaim: timeWithdrawNextClaim,
        valueUsNextClaim: ethers.formatUnits(valueToClaim[0], 6)
            }));
    } catch (error) {
      console.error("Erro no claim:", error);
      showNotification("Falha no claim. Tente novamente!", "error");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!window.ethereum || !contractAddress) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const userAddress = await window.ethereum
          .request({
            method: "eth_requestAccounts",
          })
          .then((accounts) => accounts[0]);
          const signature = Cookies.get(userAddress);

          if (!Cookies.get("user_wallet")) {
            Cookies.set("user_wallet", userAddress, { expires: 1000 });
          }else{
            if(isValidSignature(signature)){
              if(verifyMessage("Dol Global - The most innovative crypto DAO!",signature,userAddress)){
                  await checkBlacklist(userAddress,Cookies.get("user_wallet"),signature)
              }else{
                setIsOpen(true)
  
              }

            }else{
              setIsOpen(true)

            }


          }

          const ip = await getUserIp();

          
          const location = await getUserLocation();
          if(!signature){
            setIsOpen(!Cookies.get(userAddress))
          }else{
            if(isValidSignature(signature)){
              if(verifyMessage("Dol Global - The most innovative crypto DAO!",signature,userAddress)){
                await addLogs(ip,location,(isMobile)?mobileModel:osName,signature)          
              }else{
                setIsOpen(true)
              }
            }else{
              setIsOpen(true)
            }


          }

          


        const contract = new ethers.Contract(
          contractAddress,
          CONTRACT_ABI,
          provider
        );

        



        const totalEarned = await contract.userTotalEarned(userAddress);

        const dailyYield = await getTotalEarnedPerDay(userAddress, 1);

        const nextContribution = await getNextContributionToClaim(
          userAddress,
          1
        );

        const totalInvestment = await getUserTotalInvestment(userAddress);
        const timeWithdrawNextClaim = await getTimeUntilClaim(
          userAddress,
          nextContribution[0]
        );

        setSeconds(Number(timeWithdrawNextClaim));
        const valueToClaim = await previewValueToClaim(
          userAddress,
          nextContribution[0]
        );

        const currentTimestamp = Math.floor(Date.now() / 1000);
        const dailyEarned = await contract.viewTotalEarnedInADay(
          userAddress,
          currentTimestamp
        );

        setContractStats({
          userAddress: userAddress,
          totalInvestment: ethers.formatUnits(totalInvestment, 6),
          dailyYieldUs: ethers.formatUnits(dailyYield[0], 6),
          networkEarnings: ethers.formatUnits(totalEarned, 6),
          unilevelDaily: ethers.formatUnits(dailyEarned, 6),
          nextContribution: nextContribution,
          timeWithdrawNextClaim: timeWithdrawNextClaim,
          valueUsNextClaim: ethers.formatUnits(valueToClaim[0], 6),
        });

        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados do contrato:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [contractAddress]);
  
  const [isOpen, setIsOpen] = useState(false);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-[#00ffff]"></div>
      </div>
    );
  }

  return (
    <>
        <div className="space-y-6 sm:p-5 p-3">
      <div className="grid lg:grid-cols-4 sm:grid-cols-2 sm:gap-5 gap-3">
        <StatCard
          title="Investimento Total"
          value={`${Number(contractStats.totalInvestment).toFixed(2)} USDT`}
          icon={<Wallet className="sm:w-6 sm:h-6 h-4 w-4 text-[#00ffff]" />}
        />
        <StatCard
          title="Claim Diário USDT"
          value={`${Number(contractStats.dailyYieldUs).toFixed(2)} USDT`}
          icon={<Clock className="sm:w-6 sm:h-6 h-4 w-4 text-[#00ffff]" />}
        />

        <StatCard
          title="Ganhos da Rede"
          value={`${Number(contractStats.networkEarnings).toFixed(2)} USDT`}
          icon={<Users className="sm:w-6 sm:h-6 h-4 w-4 text-[#00ffff]" />}
        />
        <StatCard
          title="Ganhos da rede Diario"
          value={`${Number(contractStats.unilevelDaily).toFixed(2)} USDT`}
          icon={<Users className="sm:w-6 sm:h-6 h-4 w-4 text-[#00ffff]" />}
        />
      </div>

      <div className="bg-gradient-to-br from-[#001242]/90 to-[#001242]/70 rounded-xl p-7 border border-[#00ffff20] backdrop-blur-xl">
        <h2 className="text-xl font-bold bg-gradient-to-r from-[#00ffff] to-[#0057ff] bg-clip-text text-transparent mb-2">
          Próximo Claim
        </h2>

        <CountdownDisplay seconds={seconds} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-7">
          <div className="bg-[#00ffff10] p-4 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Valor em USDT</p>
            <p className="text-xl font-bold text-white">
              {Number(contractStats.valueUsNextClaim).toFixed(2)} USDT
            </p>
          </div>

        </div>

        <button
          onClick={() => handleClaim(contractStats.nextContribution.id)}
          className="w-full bg-gradient-to-r from-[#00ffff] to-[#0057ff] text-white py-4 rounded-lg font-bold hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02]"
        >
          Realizar Claim
        </button>
      </div>
    </div>

    {isOpen && (
        <SignMessage
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          userAddress={contractStats.userAddress}
        />
      )}

    </>

  );
};

export default Home;
