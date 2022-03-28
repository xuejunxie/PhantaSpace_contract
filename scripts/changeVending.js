const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

async function main() {
  const phantaSpace_contract = await ethers.getContractFactory("PhantaSpace");

  // connect to deployed contract
  const deployed_contract = phantaSpace_contract.attach("0x4a81bd38f6b7a4925e4e3c7cec62d9e67f401ba0");

  const owner = await deployed_contract.owner();

  console.log(owner);

  await deployed_contract.setVendingPrice(ethers.utils.parseEther("0.0000001"));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
