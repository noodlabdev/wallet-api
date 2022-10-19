const jwt = require('jsonwebtoken');
const { ethers, BigNumber } = require('ethers');

const accountValidation = require('./account.validation');

const { Account, Wallet, Token, Transaction } = require('./models');
const { catchReqRes, hash, validateSchema } = require('../utils');
const { BaseMnemonicPaths } = require('../constants');
const { envVars } = require('../config');
const {
  erc20Contract,
  getERC20Metadata,
  getERC20Balances,
  getProvider,
  getNetwork,
} = require('../web3');
const { parseEther, formatEther } = require('ethers/lib/utils');

const WALLET_PASS = '123456';

const generate = catchReqRes((req, res) => {
  const wallet = new ethers.Wallet.createRandom();
  return res.json({ mnemonic: wallet.mnemonic.phrase });
});

const login = catchReqRes(async (req, res) => {
  const { isValid, error } = validateSchema(
    req.body,
    accountValidation.loginSchema,
  );
  if (!isValid) return res.status(400).json({ error });

  const { mnemonic } = req.body;
  let mnemonicHash = hash.encrypt(mnemonic);

  let wallet = await Wallet.findOne({ mnemonic: mnemonicHash });
  let accounts = [];

  if (!wallet) {
    const newWallet = new ethers.Wallet.fromMnemonic(
      mnemonic,
      `${BaseMnemonicPaths}0`,
    );
    wallet = new Wallet({ mnemonic: mnemonicHash });
    await wallet.save();

    const keystore = await newWallet.encrypt(WALLET_PASS);
    account = new Account({
      wallet: wallet._id,
      address: newWallet.address,
      keystore,
    });
    await account.save();
    accounts = [newWallet.address];
  } else {
    const _accounts = await Account.find({ wallet: wallet._id });
    accounts = _accounts.map((a) => a.address);
  }

  const payload = {
    walletId: wallet._id,
    accounts,
  };
  const token = await jwt.sign(payload, envVars.PASSPORT_SECRET_OR_KEY, {
    expiresIn: '7d',
  });

  return res.json({ token });
});

const getAccounts = catchReqRes(async (req, res) => {
  const accounts = await Account.find({ wallet: req.user._id });
  return res.json({ accounts });
});

const add = catchReqRes(async (req, res) => {
  const mnemonic = hash.decrypt(req.user.mnemonic);

  const path = req.user.currentPath + 1;
  const wallet = new ethers.Wallet.fromMnemonic(
    mnemonic,
    `${BaseMnemonicPaths}${path}`,
  );
  const keystore = await wallet.encrypt(WALLET_PASS);
  const account = new Account({
    wallet: req.user._id,
    address: wallet.address,
    keystore,
  });
  await account.save();
  await Wallet.findByIdAndUpdate(req.user._id, {
    currentPath: path,
  });

  const _accounts = await Account.find({ wallet: req.user._id });
  const accounts = _accounts.map((a) => a._id);

  const payload = {
    walletId: wallet._id,
    accounts,
  };
  const token = await jwt.sign(payload, envVars.PASSPORT_SECRET_OR_KEY, {
    expiresIn: '7d',
  });

  return res.json({ token, account: account.address });
});

const addToken = catchReqRes(async (req, res) => {
  const { isValid, error } = validateSchema(
    req.body,
    accountValidation.addTokenSchema,
  );
  if (!isValid) return res.status(400).json({ error });

  const { address, chainId } = req.body;

  let token = await Token.findOne({
    wallet: req.user._id,
    address: address.toLowerCase(),
    chainId,
  });
  if (token) return res.status(401).json({ token: 'Already added' });
  const tokenMetadata = await getERC20Metadata(address, chainId);
  if (!tokenMetadata) return res.status(400).json({ error: 'Invalid token' });
  token = new Token({
    wallet: req.user._id,
    address,
    chainId,
    ...tokenMetadata,
  });
  token.save();

  res.json({ token });
});

const getTokens = catchReqRes(async (req, res) => {
  const { isValid, error } = validateSchema(
    req.body,
    accountValidation.getTokensSchema,
  );
  if (!isValid) return res.status(400).json({ error });

  const { account, chainId } = req.body;

  const _account = await Account.findOne({
    address: account.toLowerCase(),
    wallet: req.user._id,
  });
  if (!_account) res.status(400).json({ account: 'Account does not exists' });

  let wallet = new ethers.Wallet.fromEncryptedJsonSync(
    _account.keystore,
    WALLET_PASS,
  );
  wallet = wallet.connect(getProvider(chainId));

  const nativeBalance = await wallet.getBalance();

  const tokens = await Token.find({ wallet: req.user._id }).lean();
  const tokenAddresses = tokens.map((t) => t.address);
  const balances = await getERC20Balances(account, tokenAddresses, chainId);
  const _tokens = tokens.map((t) => ({ ...t, balance: balances[t.address] }));
  res.json({
    tokens: _tokens,
    nativeCoin: {
      ...getNetwork(chainId),
      balance: ethers.utils.formatEther(nativeBalance),
    },
  });
});

const getToken = catchReqRes(async (req, res) => {
  const { isValid, error } = validateSchema(
    req.params,
    accountValidation.getTokensSchema,
  );
  if (!isValid) return res.status(400).json({ error });

  const { address, chainId } = req.params;

  let token = await Token.findOne({
    address: address.toLowerCase(),
    chainId,
  }).select(['address', 'name', 'symbol', 'decimals', 'chainId']);
  if (token) return res.json(token);

  const tokenMetadata = await getERC20Metadata(address, chainId);
  if (!tokenMetadata) return res.status(400).json({ error: 'Invalid token' });
  token = new Token({
    wallet: req.user._id,
    address,
    chainId,
    ...tokenMetadata,
  });
  token.save();

  res.json({ token });
});

const sendToken = catchReqRes(async (req, res) => {
  const { token, from, to, amount, chainId } = req.body;

  const account = await Account.findOne({
    address: from.toLowerCase(),
    wallet: req.user._id,
  });
  if (!account) res.status(400).json({ account: 'Account does not exists' });

  const tokenMetadata = await getERC20Metadata(token, chainId);
  if (!tokenMetadata) return res.status(400).json({ error: 'Invalid token' });

  let wallet = new ethers.Wallet.fromEncryptedJsonSync(
    account.keystore,
    WALLET_PASS,
  );
  wallet = wallet.connect(getProvider(chainId));
  let tx;
  const network = getNetwork(chainId);
  try {
    if (token.toLowerCase() === network.nativeCoin.address.toLowerCase()) {
      const _amount = BigNumber.from(amount);
      const estimateGas = await getProvider(chainId).estimateGas({
        to,
        value: _amount,
      });
      tx = await wallet.sendTransaction({
        to,
        value: _amount,
        gasLimit: estimateGas,
      });
    } else {
      const contract = erc20Contract(token, wallet);
      const estimateGas = await contract.estimateGas['transfer'](to, amount);
      tx = await contract['transfer'](to, amount, { gasLimit: estimateGas });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.reason });
  }

  const newTx = new Transaction({
    account: account._id,
    from,
    to,
    token: {
      address: token,
      chainId,
      ...tokenMetadata,
    },
    chainId,
    amount,
    data: tx.data,
    nonce: tx.nonce,
    gasPrice: tx.gasPrice.toString(),
    gasLimit: tx.gasLimit.toString(),
    hash: tx.hash,
    v: tx.v,
    r: tx.r,
    s: tx.s,
  });

  await newTx.save();

  res.json(newTx);
});

const estimateSendToken = catchReqRes(async (req, res) => {
  const { token, from, to, amount, chainId } = req.body;

  const account = await Account.findOne({
    address: from.toLowerCase(),
    wallet: req.user._id,
  });
  if (!account) res.status(400).json({ account: 'Account does not exists' });

  const tokenMetadata = await getERC20Metadata(token, chainId);
  if (!tokenMetadata) return res.status(400).json({ error: 'Invalid token' });

  let wallet = new ethers.Wallet.fromEncryptedJsonSync(
    account.keystore,
    WALLET_PASS,
  );
  wallet = wallet.connect(getProvider(chainId));
  let estimateGas;
  const network = getNetwork(chainId);
  try {
    if (token.toLowerCase() === network.nativeCoin.address.toLowerCase()) {
      const _amount = BigNumber.from(amount);
      estimateGas = await getProvider(chainId).estimateGas({
        to,
        value: _amount,
      });
    } else {
      const contract = erc20Contract(token, wallet);
      estimateGas = await contract.estimateGas['transfer'](to, amount);
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.reason });
  }

  res.json({ estimateGas: formatEther(estimateGas.toString()) });
});

const getTransactions = catchReqRes(async (req, res) => {
  const { isValid, error } = validateSchema(
    req.query,
    accountValidation.getTokensSchema,
  );
  if (!isValid) return res.status(400).json({ error });

  const { account, chainId } = req.query;

  const _account = await Account.findOne({
    address: account.toLowerCase(),
    wallet: req.user._id,
  });
  if (!_account) res.status(400).json({ account: 'Account does not exists' });

  const transactions = await Transaction.find({
    account: _account._id,
    chainId,
  });
  res.json(transactions);
});

module.exports = {
  generate,
  login,
  add,
  getAccounts,
  addToken,
  getTokens,
  getToken,
  sendToken,
  getTransactions,
  estimateSendToken,
};
