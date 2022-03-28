const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

async function main() {
  const phantaSpace_contract = await ethers.getContractFactory("PhantaSpace");

  // connect to deployed contract
  const deployed_contract = phantaSpace_contract.attach("0x83f39947E54DFF3AC902217c4B2db9A359C06B66");

  const owner = await deployed_contract.owner();

  console.log(owner);

  const mint_result = await deployed_contract.safeMint(owner, 3099011541);

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
