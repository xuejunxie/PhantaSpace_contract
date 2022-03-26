const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

async function main() {
  const phantaSpace_contract = await ethers.getContractFactory("PhantaSpace");

  // connect to deployed contract
  const deployed_contract = phantaSpace_contract.attach("0xBbB8683450669b0c19ABE041BCD31c82e2794B03");

  const owner = await deployed_contract.owner();

  console.log(owner);

  const mint_result = await deployed_contract.safeMint(owner, 3090000091);

  console.log(mint_result);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
