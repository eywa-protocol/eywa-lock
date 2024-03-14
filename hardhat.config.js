require("@nomicfoundation/hardhat-toolbox");
require('hardhat-dependency-compiler');
require("@nomiclabs/hardhat-web3");
require('dotenv').config();


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },


  dependencyCompiler: {
    paths: [
      'mock/TestERC20Permit.sol'
    ],
    keep: true,
  }
};
