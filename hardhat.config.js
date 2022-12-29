require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const INFURA_API_KEY  = process.env.INFURA_API_KEY;

const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY;
const GOERLI_PRIVATE_KEY_TOKEN = process.env.GOERLI_PRIVATE_KEY_TOKEN;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY,GOERLI_PRIVATE_KEY_TOKEN]
    }
  }
};
