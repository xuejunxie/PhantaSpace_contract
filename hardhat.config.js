require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

require("hardhat-deploy");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-gas-reporter");

const { mnemonic, moralisApiKey } = require("./secrets.json");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },

  defaultNetwork: "hardhat",
  mocha: {
    timeout: 4000000,
  },
  networks: {
    hardhat: {
      blockGasLimit: 800000000000,
      allowUnlimitedContractSize: true,
    },
    rinkeby: {
      url: "https://YOUR_MORALIS_NODE_URL/eth/rinkeby",
      accounts: { mnemonic: mnemonic },
    },
  },
  etherscan: {
    apiKey: "YOUR_ETHERSCAN_API_KEY",
  },
};
