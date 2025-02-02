import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StarIcon, Users, ClockIcon, TrendingUpIcon } from "lucide-react";

const NFT_POOL_CONTRACT_ADDRESS = import.meta.env.VITE_POOL_MANAGER_ADDRESS;
const USDT_CONTRACT_ADDRESS = import.meta.env.VITE_USDT_TOKEN_ADDRESS;

const NFTCard = ({ nft, onBuyClick, ownedCount }) => (
  <div className="group relative lg:col-span-1 md:col-span-2 col-span-1">
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-gray-900/90 to-gray-950/90 transition-transform duration-300 hover:-translate-y-1">
      <div className="relative h-48">
        <div
          className={`absolute inset-0 bg-${nft.color} mix-blend-color-dodge opacity-20`}
        />
        <img
          src={nft.image}
          alt={nft.tier}
          className="h-full w-full object-cover brightness-110 contrast-125 saturate-150"
        />
      </div>

      <div className="relative space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">{nft.tier}</h3>
          <div className="rounded-lg bg-white/5 px-3 py-1">
            <span className="font-medium text-white">{nft.price} USDT</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat
            icon={<TrendingUpIcon />}
            label="Retorno"
            value={`${nft.returns}%`}
          />
          <Stat icon={<StarIcon />} label="Max" value={`${nft.maxPayout}%`} />
          <Stat icon={<Users />} label="Seus NFTs" value={ownedCount} />
        </div>

        <button
          onClick={() => onBuyClick(nft)}
          className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 p-[1px]"
        >
          <div className="rounded-lg bg-gray-950/50 px-4 py-2 text-center">
            <span className="font-bold text-white">Comprar NFT</span>
          </div>
        </button>
      </div>
    </div>
  </div>
);

const Stat = ({ icon, label, value }) => (
  <div className="space-y-1 rounded-lg bg-white/5 p-2 text-center">
    <div className="mx-auto h-4 w-4 text-blue-400">{icon}</div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-bold text-white">{value}</p>
  </div>
);

const QueueDisplay = ({ data, index }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-bold text-white">Fila {index}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((entry, i) => (
        <div key={i} className="p-4 rounded-lg bg-gray-800/50">
          <p className="text-sm text-gray-400">Endereço</p>
          <p className="text-sm font-mono text-white truncate">{entry.user}</p>
          <p className="text-sm text-gray-400 mt-2">Posição</p>
          <p className="text-lg font-bold text-white">{entry.index}</p>
        </div>
      ))}
    </div>
  </div>
);

const NFTPage = () => {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [provider, setProvider] = useState(null);

  const nfts = [
    {
      image: "/nfts/Esmeralda.png",
      tier: "Esmeralda",
      price: 100,
      returns: 150,
      maxPayout: 50,
      color: "emerald-500",
      contractId: 1,
    },
    {
      image: "/nfts/Safira.png",
      tier: "Safira",
      price: 50,
      returns: 100,
      maxPayout: 50,
      color: "blue-500",
      contractId: 2,
    },
    {
      image: "/nfts/Ametista.png",
      tier: "Ametista",
      price: 10,
      returns: 15,
      maxPayout: 50,
      color: "purple-500",
      contractId: 3,
    },
  ];

  useEffect(() => {
    const initProvider = async () => {
      if (!window.ethereum) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await window.ethereum
          .request({
            method: "eth_requestAccounts",
          })
          .then((accounts) => accounts[0]);

        setProvider(provider);
        setUserAddress(userAddress);

        window.ethereum.on("accountsChanged", (accounts) =>
          setUserAddress(accounts[0])
        );

        return () => {
          window.ethereum.removeListener("accountsChanged", (accounts) =>
            setUserAddress(accounts[0])
          );
        };
      } catch (error) {
        console.error("Erro ao conectar carteira:", error);
      }
    };

    initProvider();
  }, []);

  const handleBuyClick = async (nft) => {
    try {
      const signer = await provider.getSigner();
      const usdtContract = new ethers.Contract(
        USDT_CONTRACT_ADDRESS,
        ["function approve(address spender, uint256 amount)"],
        signer
      );
      const nftContract = new ethers.Contract(
        NFT_POOL_CONTRACT_ADDRESS,
        [
          "function addToQueue(uint256 queueId)",
          "function viewCurrentQueues()",
        ],
        signer
      );

      const approveAmount = ethers.parseUnits(nft.price.toString(), 6);
      const approveTx = await usdtContract.approve(
        NFT_POOL_CONTRACT_ADDRESS,
        approveAmount
      );
      await approveTx.wait();

      const buyTx = await nftContract.addToQueue(nft.contractId);
      await buyTx.wait();

      const queuesData = await nftContract.viewCurrentQueues();
      setQueueData(queuesData);
      setSelectedNFT(nft);
    } catch (error) {
      console.error("Erro na transação:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-4xl font-bold text-transparent">
            NFTs Collection
          </h1>
          <p className="mt-2 text-gray-400">
            Adquira NFTs exclusivos e maximize seus ganhos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <NFTCard
              key={nft.tier}
              nft={nft}
              onBuyClick={handleBuyClick}
              ownedCount={0}
            />
          ))}
        </div>

        {selectedNFT && queueData && (
          <Dialog open onOpenChange={() => setSelectedNFT(null)}>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Filas do NFT {selectedNFT.tier}
                </h2>

                <div className="space-y-8">
                  {queueData.map((queue, index) => (
                    <QueueDisplay key={index} data={queue} index={index + 1} />
                  ))}
                </div>

                <Button
                  onClick={() => setSelectedNFT(null)}
                  className="mt-6 w-full bg-gray-800 hover:bg-gray-700"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default NFTPage;
