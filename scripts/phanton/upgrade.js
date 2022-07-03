const { ethers, upgrades } = require("hardhat");

// TO DO: Place the address of your proxy here!
const proxyAddress = "0x012a00e7f04816605ca1edef48f1e9dd622b811e";

async function main() {
  const PhantonV2 = await ethers.getContractFactory("Phanton");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, PhantonV2);
  console.log("upgrade address : ", upgraded.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
