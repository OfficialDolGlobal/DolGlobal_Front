import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, Copy, Users, Link as LinkIcon } from "lucide-react";
import {ChevronRight } from "lucide-react";
import { ethers } from "ethers";
import CONTRACT_ABI from "../../abis/user.abi.json";
import {
  allowanceUsdt,
  getProvider,
  getUserTotalEarnedTreasury,
  getUserTotalInvestment,
  mintNftGlobal,
  availableUnilevel,
  getUserData,
  getSignature,
  updateValidation,
} from "../../services/Web3Services";
import { approveUsdt } from "../../services/Web3Services";
import BalanceBar from "./BalanceBar"; // Ajuste o caminho conforme necessário

import { useNotification } from "../modals/useNotification";
import VerifyAccount from "../modals/VerifyAccount";

const USER_CONTRACT = import.meta.env.VITE_USER_REFERRAL_ADDRESS;
const COLLECTION_CONTRACT = import.meta.env.VITE_COLLECTION_ADDRESS;
const API_URL = import.meta.env.VITE_API_URL;

const NetworkNode = ({ user, level, expandedNodes, onToggle }) => {

  
  const hasChildren = user.referrals && user.referrals.length > 0;
  const isExpanded = expandedNodes.has(user.wallet);

  return (
    <div className={`relative ${level > 0 ? "ml-4 md:ml-6" : ""}`}>
      <div className="relative flex flex-col md:flex-row items-start md:items-center p-4 bg-[#001242]/80 backdrop-blur-xl rounded-xl border border-[#00ffff20] mb-3 group hover:border-[#00ffff40] transition-all duration-300">
        {level > 0 && (
          <>
            <div className="absolute -left-4 md:-left-6 top-1/2 w-4 md:w-6 h-px bg-[#00ffff20]" />
            <div className="absolute -left-4 md:-left-6 -top-8 w-px h-8 bg-[#00ffff20]" />
          </>
        )}

        {hasChildren && (
          <button
            onClick={() => onToggle(user.wallet)}
            className="absolute -left-6 md:-left-8 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full bg-[#001242] border border-[#00ffff20] hover:border-[#00ffff] transition-all duration-300 z-10"
          >
            <ChevronDown
              className={`w-4 h-4 text-[#00ffff] transform transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        )}

        <div className="flex-1 flex flex-col md:flex-row md:items-center w-full gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00ffff20] to-[#0057ff20] flex items-center justify-center">
              <Users className="w-6 h-6 text-[#00ffff]" />
            </div>
            <div>
              <div className="text-white font-medium truncate max-w-[120px] md:max-w-[200px]">
                {user.wallet}
              </div>
              <div className="text-[#00ffff]/60 text-sm">Nível {level}</div>
            </div>
          </div>

          <div className="flex flex-row md:ml-auto gap-6 mt-2 md:mt-0">
            <div className="text-center">
              <div className="text-white/60 text-sm">Volume</div>
              <div className="text-[#00ffff] font-medium">
                {ethers.formatUnits(user.volume || "0", 6)} USDT
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/60 text-sm">Diretos</div>
              <div className="text-[#00ffff] font-medium">
                {user.referrals?.length || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="pl-4 md:pl-8 border-l border-[#00ffff20]">
          {user.referrals.map((childAddress) => (
            <NetworkNodeLoader
              key={childAddress}
              userAddress={childAddress}
              level={level + 1}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const NetworkNodeLoader = ({ userAddress, level, expandedNodes, onToggle }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const provider = await getProvider();
        const contract = new ethers.Contract(
          USER_CONTRACT,
          CONTRACT_ABI,
          provider
        );

        const user = await contract.getUser(userAddress);
        const totalEarned = await contract.userTotalEarned(userAddress);

        setUserData({
          wallet: userAddress,
          volume: totalEarned.toString(),
          referrals: user[3],
          contractAddress: USER_CONTRACT,
        });
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userAddress]);

  if (loading) return <div className="text-white/60 p-4">Carregando...</div>;
  if (!userData)
    return <div className="text-white/60 p-4">Erro ao carregar dados</div>;

  return (
    <NetworkNode
      user={userData}
      level={level}
      expandedNodes={expandedNodes}
      onToggle={onToggle}
    />
  );
};

const Network = ({ userWallet }) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const showNotification = useNotification();
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [phoneSignature, setPhoneSignature] = useState(null);
  const [emailSignature, setEmailSignature] = useState(null);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVolume: "0",
    directReferrals: 0,
    indirectReferrals: 0,
    totalUsers: 0,
    maxUnilevel: 0,
    unilevelReached: 0,
  });
  const [investment, setInvestment] = useState("");
  const [allowanceNft, setAllowanceNft] = useState(0);
  const [networkData, setNetworkData] = useState({ tree: [], directs: 0, indirects: 0 });


const [expandedLevels, setExpandedLevels] = useState({}); 

const toggleLevel = (level) => {
  setExpandedLevels((prev) => ({
    ...prev,
    [level]: !prev[level], 
  }));
};


  const groupByLevel = (data) => {
    if (!data || data.length === 0) return {};
  
    return data.reduce((acc, node) => {
      const level = node.level;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(node);
      return acc;
    }, {});
  };
  



  useEffect(() => {
    const fetchNetworkData = async () => {
      
      try {
        let directs, indirects, tree;

        try {

          const response = await axios.get(`${API_URL}api/tree?sponsorId=${String(userWallet).toLowerCase()}`);

          
          tree = response.data.tree          
          directs = response.data.directs;
          indirects = response.data.indirects;
  
        } catch (error) {
          directs = 0;
          indirects = 0;
          tree = []
        }
        setLoading(true);

    
        setNetworkData({tree, directs, indirects });        
        setLoading(false);
      } catch (err) {
        
        setLoading(false);
      }
    };

    if (userWallet) {
      fetchNetworkData();
    }
  }, [userWallet]);

  const groupedData = groupByLevel(networkData.tree);


  

  const handleApprove = async () => {
    if(investment < 10){
      showNotification("Minimo necessário é 10 usdt", "error");
      return;
    }
    if (!investment) {
      showNotification("Por favor, insira o valor do investimento.", "info");
      return;
    }

    setIsApproving(true);
    try {
      await approveUsdt(
        COLLECTION_CONTRACT,
        ethers.parseUnits(investment ? investment : 0, 6)
      );
      const allowanceNft = await allowanceUsdt(userWallet, COLLECTION_CONTRACT);
      setAllowanceNft(allowanceNft);
      showNotification("Aprovação realizada com sucesso!", "success");
    } catch (error) {
      console.error("Erro na aprovação:", error);
      if (error.message.includes("User not verified")) {
        showNotification("Verifique sua identificação!", "error");
      } else {
        showNotification("Erro desconhecido, tente novamente!", "error");
      }
    } finally {
      setIsApproving(false);
    }
  };

  const handleBuyRoof = async () => {
    if(investment < 10){
      showNotification("Minimo necessário é 10 usdt", "error");
      return;
    }
    if (!investment) {
      showNotification("Por favor, insira o valor do investimento.", "info");
      return;
    }
    
    const userData = await getUserData(userWallet)
    
    if(!userData[0].phone_verified || !userData[0].email_verified){
      setIsOpen(true)
      return
    }


    setIsActivating(true);

    try {

      if(!emailSignature){
        const signature = await getSignature(userData[0].email)
        setEmailSignature(signature)
      }

      if(!phoneSignature){
        const signature = await getSignature(userData[0].phone)
        setPhoneSignature(signature)
      }

      await updateValidation(userData[0].email,userData[0].phone,emailSignature,phoneSignature)


      await mintNftGlobal(ethers.parseUnits(investment ? String(investment) : 0, 6));

      showNotification("Compra realizada com sucesso!", "success");

      const allowanceNft = await allowanceUsdt(userWallet, COLLECTION_CONTRACT);

      setAllowanceNft(allowanceNft);
      const availableUnilevelStruct = await availableUnilevel(userWallet);

      setStats((prevStats) => ({
        ...prevStats,
        maxUnilevel: availableUnilevelStruct[0],
        unilevelReached: availableUnilevelStruct[1],
      }));
    } catch (error) {
      console.error("Erro na aprovação:", error);
      if (error.message.includes("User not verified")) {
        showNotification("Verifique sua identificação!", "error");
      } else {
        showNotification("Erro desconhecido, tente novamente!", "error");
      }
    } finally {
      setIsActivating(false);
    }
  };

  useEffect(() => {
    const loadNetworkData = async () => {
      if (!userWallet) return;

      try {
        const provider = await getProvider();
        const contract = new ethers.Contract(
          USER_CONTRACT,
          CONTRACT_ABI,
          provider
        );

        const user = await contract.getUser(userWallet);
        const totalEarned = await contract.userTotalEarned(userWallet);
        const totalInvested = await getUserTotalInvestment(userWallet);
        const totalEarnedTreasury = await getUserTotalEarnedTreasury(
          userWallet
        );

        const userData = {
          wallet: userWallet,
          volume: totalEarned.toString(),
          referrals: user[3],
          contractAddress: USER_CONTRACT,
        };

        const allowanceNft = await allowanceUsdt(
          userWallet,
          COLLECTION_CONTRACT
        );
        setAllowanceNft(allowanceNft);
        const availableUnilevelStruct = await availableUnilevel(userWallet);

        setStats({
          totalVolume: ethers.formatUnits(
            totalInvested + totalEarnedTreasury,
            6
          ),
          directReferrals: stats.directReferrals,
          indirectReferrals: stats.indirectReferrals,
          totalUsers: user[3].length,
          maxUnilevel: availableUnilevelStruct[0],
          unilevelReached: availableUnilevelStruct[1],
        });
      } catch (error) {
        console.error("Erro ao carregar dados da rede:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNetworkData();
  }, [userWallet]);



  const copyLink = () => {
    navigator.clipboard.writeText(`https://dol.global?ref=${userWallet}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  

  if (loading) return (
    <div className="flex items-center justify-center h-72">
      <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-[#00ffff]"></div>
    </div>
  );

  if (!networkData)
    return (
      <div className="text-white text-center p-8">
        Erro ao carregar dados da rede
      </div>
    );

  return (
    <div className="space-y-6 p-4">
      {/* Seção Global */}
      <div className="bg-[#001242]/80 backdrop-blur-xl rounded-xl p-6 border border-[#00ffff20]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-2xl font-bold text-transparent">
              NFT Global
            </h2>
            <p className="text-gray-400">
              Potencialize suas recompensas em até 200%
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Aporte Mínimo</p>
            <p className="text-2xl font-bold text-cyan-400">10 USDT</p>
          </div>
        </div>

        <BalanceBar
          available={Number(
            ethers.formatUnits(stats.maxUnilevel - stats.unilevelReached, 6)
          )}
          receivedAmount={Number(ethers.formatUnits(stats.unilevelReached, 6))}
          pendingAmount={Number(ethers.formatUnits(stats.maxUnilevel, 6))}
        />
        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <input
            type="number"
            value={investment}
            onChange={(e) => {

              setInvestment(e.target.value);
            }}  
            placeholder="10.00"
            className="flex-1 rounded-lg bg-gray-900/50 px-4 py-3 text-white outline-none ring-1 ring-white/10 transition-all focus:bg-gray-900/80 focus:ring-cyan-500/50"
          />

          <button
            onClick={() => {
              const parsedInvestment = investment
                ? ethers.parseUnits(String(investment), 6)
                : ethers.parseUnits("0", 6);

              
              if (allowanceNft < parsedInvestment) {
                handleApprove();
              } else {
                handleBuyRoof();
              }
            }}
            disabled={isApproving || isActivating}
            className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 p-[1px] transition-all duration-300 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="rounded-lg bg-gray-950/50 px-6 py-3 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2">
                {(isApproving || isActivating) && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
                <span className="font-bold text-white">
                {isApproving
  ? "Aprovando..."
  : isActivating
  ? "Ativando..."
  : (ethers.parseUnits(String(investment || "0"), 6) <= (allowanceNft))
  ? "Ativar Unilevel"
  : "Approve"}


                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
      <VerifyAccount setIsOpen={setIsOpen} isOpen={isOpen} userAddress={userWallet} setEmailSignature={setEmailSignature} setPhoneSignature={setPhoneSignature} phoneSignature={phoneSignature} emailSignature={emailSignature}></VerifyAccount>

      <div className="bg-[#001242]/80 backdrop-blur-xl rounded-xl p-6 border border-[#00ffff20]">
        <div className="flex items-center gap-3 mb-4">
          <LinkIcon className="w-5 h-5 text-[#00ffff]" />
          <h2 className="text-xl font-bold text-[#00ffff]">
            Seu Link de Indicação
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-[#000c2a] rounded-lg p-3 border border-[#00ffff10] focus-within:border-[#00ffff40] transition-colors">
            <input
              type="text"
              value={`https://dol.global?ref=${userWallet}`}
              className="w-full bg-transparent text-white/80 outline-none text-sm md:text-base"
              readOnly
            />
          </div>
          <button
            onClick={copyLink}
            className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              copied
                ? "bg-green-500/20 text-green-400"
                : "bg-[#00ffff20] text-[#00ffff] hover:bg-[#00ffff30]"
            }`}
          >
            <Copy className="w-5 h-5" />
            <span>{copied ? "Copiado!" : "Copiar"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Volume Total"
          value={`${Number(stats.totalVolume).toLocaleString()} USDT`}
        />

        <StatCard label="Diretos" value={`${String(networkData.directs)} Usuários`} />
        <StatCard label="Indiretos" value={`${String(networkData.indirects)} Usuários`} />
      </div>
  
      <div className="bg-[#001242]/80 backdrop-blur-xl rounded-xl p-4 md:p-6 border border-[#00ffff20] overflow-x-auto">
        <div className="min-w-[300px] md:min-w-[600px] p-4">

         <div className="space-y-6">
  {Object.entries(groupedData).map(([level, users]) => (
    <div key={level} className="bg-gray-800 p-4 rounded-lg">
      {/* Cabeçalho do nível com botão de toggle */}
      <button
        onClick={() => toggleLevel(level)}
        className="flex items-center justify-between w-full text-lg font-bold text-[#00ffff] focus:outline-none"
      >
        <span>Nível {level}</span>
        {expandedLevels[level] ? (
          <ChevronDown className="w-5 h-5 text-[#00ffff]" />
        ) : (
          <ChevronRight className="w-5 h-5 text-[#00ffff]" />
        )}
      </button>

      {/* Exibe a lista apenas quando expandido */}
      {expandedLevels[level] && (
        <ul className="mt-2 space-y-2 transition-all duration-300 ease-in-out">
          {users.map((user, index) => (
            <li key={index} className="p-2 border border-[#00ffff20] rounded-md">
              <p className="text-white">Sponsor: {user.sponsor}</p>
              <p className="text-gray-400">Total de Usuários: {user.totalusers}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  ))}
</div>;

        </div>
      </div>
    </div>

    
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-[#001242]/80 backdrop-blur-xl rounded-xl p-4 border border-[#00ffff20] hover:border-[#00ffff40] transition-all duration-300">
    <div className="text-white/60 text-sm mb-1">{label}</div>
    <div className="text-xl font-bold text-[#00ffff]">{value}</div>
  </div>
);

export default Network;
