const { ethers } = require('ethers');

exports.DEFAULT_CHAIN_ID = 1924;

exports.NETWORK_SUPPORTED = [
  {
    name: 'Binance Smart Chain Testnet',
    chainId: 97,
    rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    nativeCoin: {
      address: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
      name: 'BNB',
      symbol: 'BNB',
      decimals: '18',
    },
  },
  {
    name: 'Binance Smart Chain',
    chainId: 56,
    rpc: 'https://bsc-dataseed1.ninicoin.io/',
    nativeCoin: {
      address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      name: 'BNB',
      symbol: 'BNB',
      decimals: '18',
    },
  },
  {
    name: 'Fahrenheit Chain',
    chainId: this.DEFAULT_CHAIN_ID,
    rpc: 'https://rpc-mainnet.fahrenheitchain.com/',
    nativeCoin: {
      address: '0x0000000000000000000000000000000000000802',
      name: 'Fahrenheit Coin',
      symbol: 'FAC',
      decimals: '18',
    },
  },
];

exports.CHAIN_ID_SUPPORTED = this.NETWORK_SUPPORTED.map((e) =>
  parseInt(e.chainId),
);

exports.getNetwork = (chainId) => {
  let c = parseInt(chainId || this.DEFAULT_CHAIN_ID);
  const idx = this.CHAIN_ID_SUPPORTED.findIndex((e) => c === e);
  return this.NETWORK_SUPPORTED[idx];
};

const abi = [
  'function balanceOf(address) view returns (uint)',
  'function transfer(address, uint) returns (bool)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint)',
];

exports.getProvider = (chainId) => {
  const network = this.getNetwork(chainId);
  return new ethers.providers.JsonRpcBatchProvider(network.rpc);
};

exports.erc20Contract = (
  address,
  signer = undefined,
  chainId = this.DEFAULT_CHAIN_ID,
) => {
  const providerOrSigner = signer ? signer : this.getProvider(chainId);
  return new ethers.Contract(address, abi, providerOrSigner);
};

exports.getERC20Metadata = async (address, chainId = this.DEFAULT_CHAIN_ID) => {
  try {
    const contract = this.erc20Contract(address, undefined, chainId);
    const [name, symbol, decimals] = await Promise.all([
      contract['name'](),
      contract['symbol'](),
      contract['decimals'](),
    ]);
    return {
      name,
      symbol,
      decimals: decimals.toString(),
    };
  } catch (error) {
    console.log(error);
    // throw new Error('Token invalid');
    return undefined;
  }
};

exports.getERC20Balances = async (
  account,
  addresses,
  chainId = this.DEFAULT_CHAIN_ID,
) => {
  const contracts = addresses.map((addr) =>
    this.erc20Contract(addr, undefined, chainId),
  );
  const balances = await Promise.all(
    contracts.map((c) => c['balanceOf'](account)),
  );
  const decimals = await Promise.all(contracts.map((c) => c['decimals']()));
  return addresses.reduce((acc, addr, idx) => {
    acc[addr] = ethers.utils.formatEther(balances[idx], decimals.toString());
    return acc;
  }, {});
};
