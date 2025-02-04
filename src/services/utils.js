function formatWallet(walletAddress) {
    if (walletAddress.length != 42) {
        throw new Error('Invalid address');
    }
    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
}

module.exports = { formatWallet }; 