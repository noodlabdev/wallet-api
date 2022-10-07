const { ethers } = require('ethers');

const RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';

exports.NativeCoin = {
  address: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
  name: 'BNB',
  symbol: 'BNB',
  decimals: '18',
};

const abi = [
  'function balanceOf(address) view returns (uint)',
  'function transfer(address, uint) returns (bool)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint)',
];

exports.EthersProvider = new ethers.providers.JsonRpcBatchProvider(RPC);

exports.erc20Contract = (address, signer = undefined) => {
  const providerOrSigner = signer
    ? signer
    : new ethers.providers.JsonRpcBatchProvider(RPC);
  return new ethers.Contract(address, abi, providerOrSigner);
};

exports.getERC20Metadata = async (address) => {
  try {
    const contract = this.erc20Contract(address);
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
    throw 'Token invalid';
  }
};

exports.getERC20Balances = async (account, addresses) => {
  const contracts = addresses.map((addr) => this.erc20Contract(addr));
  const balances = await Promise.all(
    contracts.map((c) => c['balanceOf'](account)),
  );
  const decimals = await Promise.all(contracts.map((c) => c['decimals']()));
  return addresses.reduce((acc, addr, idx) => {
    acc[addr] = ethers.utils.formatEther(balances[idx], decimals.toString());
    return acc;
  }, {});
};
