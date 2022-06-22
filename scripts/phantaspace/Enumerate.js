const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

async function main() {
  const phantaSpace_contract = await ethers.getContractFactory("PhantaSpace");

  // connect to deployed contract
  const deployed_contract = phantaSpace_contract.attach("0x68fA24fd81e2f4e72437d56B15C46601459Cae0e");

  const owner = await deployed_contract.owner();

  console.log(owner);

  const NFT_numbers = await deployed_contract.balanceOf("0x88C6c24947FF5aAF019026C95D7853878e2517d3");
  console.log(NFT_numbers);
  for (let i = 0; i < NFT_numbers; i++) {
    const NFT = await deployed_contract.tokenOfOwnerByIndex("0x88C6c24947FF5aAF019026C95D7853878e2517d3", i);
    console.log("NFT :", NFT);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
