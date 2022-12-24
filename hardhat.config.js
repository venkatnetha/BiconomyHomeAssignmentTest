require("@nomicfoundation/hardhat-toolbox");

const INFURA_API_KEY  = "c2f8ade529cb4d60b12c58c4caa73c89"

const GOERLI_PRIVATE_KEY = "e1a863ecced8da882aad4d4801520fea95946c626f35cb591b4af4d4af37a7f7"
const GOERLI_PRIVATE_KEY_TOKEN = "1926650ea869835e5d02d4717835747e99e6f081719ef6b0f187ee00c7a3fbf4"

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
