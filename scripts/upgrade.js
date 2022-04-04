const { ethers, upgrades } = require("hardhat");

// TO DO: Place the address of your proxy here!
const proxyAddress = "0xA7B6d24152c30999Ee585D94db2af6408Faf275e";

async function main() {
  const PhantaSpaceV2 = await ethers.getContractFactory("PhantaSpace");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, PhantaSpaceV2);
  console.log("upgrade address : ", upgraded.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
