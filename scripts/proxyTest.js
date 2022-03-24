// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { upgrades } = require("hardhat");
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const precision = 1;
  const imageURL = "https://tset/";
  const animationURL = "https://teset/";
  const externalURL = "https://test/";
  const vendingPrice = ethers.utils.parseEther("0.08");
  const auctionDuration = 24 * 3600;
  const royalty = 10000;

  const MyTokenV1 = await ethers.getContractFactory("MyToken");

  const test = await upgrades.deployProxy(MyTokenV1, [
    precision,
    imageURL,
    animationURL,
    externalURL,
    vendingPrice,
    auctionDuration,
    royalty,
  ]);

  console.log("MyTokenV1 deployed to :", test.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
