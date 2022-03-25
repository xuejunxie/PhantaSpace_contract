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
  phantaSpace_contract = await ethers.getContractFactory("PhantaSpace");

  const imageURL = "https://phanta.space/#/NFT/space/";
  const animationURL = "https://phanta.space/#/NFT/space/";
  const externalURL = "https://phanta.space/#/space/";
  const vendingPrice = ethers.utils.parseEther("0.01");
  const auctionDuration = 24 * 3600;
  const royalty = 1000;

  deployed_contract = await upgrades.deployProxy(
    phantaSpace_contract,
    [imageURL, animationURL, externalURL, vendingPrice, auctionDuration, royalty],
    {
      kind: "uups",
    }
  );

  console.log("deployed_contract :", deployed_contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
