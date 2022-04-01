const { ethers, upgrades } = require("hardhat");

// TO DO: Place the address of your proxy here!
const proxyAddress = "0x68fA24fd81e2f4e72437d56B15C46601459Cae0e";

async function main() {
  const PhantaSpaceV2 = await ethers.getContractFactory("PhantaSpace");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, PhantaSpaceV2);
  console.log((await upgraded.area()).toString());
  console.log((await upgraded.perimeter()).toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
