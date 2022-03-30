const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

async function main() {
  const phantaSpace_contract = await ethers.getContractFactory("PhantaSpace");

  // connect to deployed contract
  const deployed_contract = phantaSpace_contract.attach("0x68fA24fd81e2f4e72437d56B15C46601459Cae0e");

  const owner = await deployed_contract.owner();

  console.log(owner);

  const mint_result = await deployed_contract.vending({
    value: ethers.utils.parseEther("0.00002"),
  });

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
