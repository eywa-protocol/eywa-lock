require('@nomicfoundation/hardhat-toolbox');
require('hardhat-dependency-compiler');
require('@nomiclabs/hardhat-web3');
require('dotenv').config();
require('hardhat-gas-reporter');
require('hardhat-contract-sizer');
require('solidity-coverage');


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
      chainId: 250,
      forking: {
        url: 'https://rpc2.fantom.network',
      },
      allowUnlimitedContractSize: true,
      gasPrice: 150000000000,
      initialBaseFeePerGas: 0
    },
    fantomtestnet:{
      url: 'https://rpc.testnet.fantom.network'
    },
    fantom:{
      url: 'https://fantom-mainnet.public.blastapi.io',
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      bsc: process.env.BINANCESCAN_API_KEY,
      bscTestnet: process.env.BINANCESCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
      avalanche: process.env.AVALANCHESCAN_API_KEY,
      avalancheFujiTestnet: process.env.AVALANCHESCAN_API_KEY,
      aurora: process.env.AURORA_API_KEY,
      auroraTestnet: process.env.AURORA_API_KEY,
      opera: process.env.FANTOM_API_KEY,
      ftmTestnet: process.env.FANTOM_API_KEY,
      arbitrumOne: process.env.ARBITRUM_API_KEY,
      arbitrumTestnet: process.env.ARBITRUM_API_KEY,
      optimisticEthereum: process.env.OPTIMISM_API_KEY,
      optimisticGoerli: process.env.OPTIMISM_API_KEY
    }
  },
  dependencyCompiler: {
    paths: [
      'mock/TestERC20Permit.sol'
    ],
    keep: true,
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 70,
    showTimeSpent: true,
    token: 'FTM',
    gasPriceApi: 'https://api.bscscan.com/api?module=proxy&action=eth_gasPrice',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: false
  },
};
