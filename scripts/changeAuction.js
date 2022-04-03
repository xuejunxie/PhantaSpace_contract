const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

async function main() {
  const phantaSpace_contract = await ethers.getContractFactory("PhantaSpace");

  // connect to deployed contract
  const deployed_contract = phantaSpace_contract.attach("0x0Eae3B524135E0a92CcD3DfBA433D2A89aeB150B");

  const owner = await deployed_contract.owner();

  console.log(owner);

  await deployed_contract.setAuctionDuration(30 * 60);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
