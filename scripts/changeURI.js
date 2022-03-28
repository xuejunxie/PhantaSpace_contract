const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

async function main() {
  const phantaSpace_contract = await ethers.getContractFactory("PhantaSpace");

  // connect to deployed contract
  const deployed_contract = phantaSpace_contract.attach("0xBFF1b6c9eff03b995cf216E149FDB00b4783a3BC");

  const owner = await deployed_contract.owner();

  console.log(owner);

  await deployed_contract.setBaseURI("http://phantaspace.com/metadata/");
  await deployed_contract.setContractURI("http://phantaspace.com/contract");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
