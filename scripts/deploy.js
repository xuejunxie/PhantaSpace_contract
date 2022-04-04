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
  const phantaSpace_contract = await ethers.getContractFactory("PhantaSpace");
  [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
  console.log("owner :", owner.address);

  const metadataURL = "http://phantaspace.com/metadata/";
  const contractURI = "http://phantaspace.com/contract/";
  const vendingPrice = ethers.utils.parseEther("0.00001");
  const auctionDuration = 30 * 60;
  const royalty = 1000;

  const deployed_contract = await upgrades.deployProxy(
    phantaSpace_contract,
    [metadataURL, contractURI, vendingPrice, auctionDuration, royalty],
    { kind: "uups" }
  );

  console.log("deployed_contract :", deployed_contract.address);

  // const testMint = 3099011651;

  // const mint_result = await deployed_contract.safeMint(owner.address, testMint);

  // console.log("https://testnets.opensea.io/assets/" + deployed_contract.address + "/" + testMint);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
