const jwt = require('jsonwebtoken');
const { ethers, BigNumber } = require('ethers');

const { loginSchema } = require('./account.validation');

const { Account, Wallet, Token } = require('./models');
const { catchReqRes, hash, validateSchema } = require('../utils');
const { BaseMnemonicPaths } = require('../constants');
const { envVars } = require('../config');
const {
  erc20Contract,
  getERC20Metadata,
  getERC20Balances,
  EthersProvider,
  NativeCoin,
} = require('../web3');

const WALLET_PASS = '123456';

const generate = catchReqRes((req, res) => {
  const wallet = new ethers.Wallet.createRandom();
  console.log(wallet);
  return res.json({ mnemonic: wallet.mnemonic.phrase });
});

const login = catchReqRes(async (req, res) => {
  // const { error } = TLDVerificationSchema.validate(params);

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
  const { address } = req.body;

  let token = await Token.findOne({ address: address.toLowerCase() });
  if (token) return res.status(401).json({ token: 'Already added' });

  const tokenMetadata = await getERC20Metadata(address);
  token = new Token({
    wallet: req.user._id,
    address,
    ...tokenMetadata,
  });
  token.save();

  res.json({ token });
});

const getTokens = catchReqRes(async (req, res) => {
  const { account } = req.body;

  const _account = await Account.findOne({
    address: account.toLowerCase(),
    wallet: req.user._id,
  });
  if (!_account) res.status(400).json({ account: 'Account does not exists' });

  let wallet = new ethers.Wallet.fromEncryptedJsonSync(
    _account.keystore,
    WALLET_PASS,
  );
  wallet = wallet.connect(EthersProvider);

  const nativeBalance = await wallet.getBalance();

  const tokens = await Token.find({ wallet: req.user._id }).lean();
  const tokenAddresses = tokens.map((t) => t.address);
  const balances = await getERC20Balances(account, tokenAddresses);
  const _tokens = tokens.map((t) => ({ ...t, balance: balances[t.address] }));
  res.json({
    tokens: _tokens,
    nativeCoin: {
      ...NativeCoin,
      balance: ethers.utils.formatEther(nativeBalance),
    },
  });
});

const getToken = catchReqRes(async (req, res) => {
  const { address } = req.params;

  let token = await Token.findOne({ address: address.toLowerCase() }).select([
    'address',
    'name',
    'symbol',
    'decimals',
  ]);
  if (token) return res.json(token);

  const tokenMetadata = await getERC20Metadata(address);
  token = new Token({
    wallet: req.user._id,
    address,
    ...tokenMetadata,
  });
  token.save();

  res.json({ token });
});

const sendToken = catchReqRes(async (req, res) => {
  const { token, from, to, amount } = req.body;

  const account = await Account.findOne({
    address: from.toLowerCase(),
    wallet: req.user._id,
  });
  if (!account) res.status(400).json({ account: 'Account does not exists' });

  let wallet = new ethers.Wallet.fromEncryptedJsonSync(
    account.keystore,
    WALLET_PASS,
  );
  wallet = wallet.connect(EthersProvider);
  let tx;
  if (token.toLowerCase() === NativeCoin.address.toLowerCase()) {
    const _amount = BigNumber.from(amount);
    const estimateGas = await EthersProvider.estimateGas({
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

  res.json({ transaction: tx });

  // const account = await Account.findOne({account: })

  // let token = await Token.findOne({ address }).select([
  //   'address',
  //   'name',
  //   'symbol',
  //   'decimals',
  // ]);
  // if (token) return res.json(token);

  // const tokenMetadata = await getERC20Metadata(address);
  // token = new Token({
  //   wallet: req.user._id,
  //   address,
  //   ...tokenMetadata,
  // });
  // token.save();

  // res.json({ token });
});

module.exports = {
  generate,
  login,
  add,
  addToken,
  getTokens,
  getToken,
  sendToken,
};
