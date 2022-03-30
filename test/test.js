const { expect } = require("chai");
const { ethers, upgrades, network, waffle } = require("hardhat");
const { networks } = require("../hardhat.config");

//  // short code to get private key from mnemonic
// let mnemonic = "";
// let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
// console.log("==========================");
// console.log(mnemonicWallet.privateKey);

describe("PhantaSpace", function () {
  let phantaSpace_contract;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let deployed_contract;
  let imageURL;
  let animationURL;
  let externalURL;
  let vendingPrice;
  let auctionDuration;
  let royalty;
  let rawContractURI;
  let encodedContractURI;

  beforeEach(async function () {
    phantaSpace_contract = await ethers.getContractFactory("PhantaSpace");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    metadataURL = "https://phantaspace.com/metadata/";
    contractURI = "https://phantaspace.com/contract/";
    vendingPrice = ethers.utils.parseEther("0.01");
    auctionDuration = 24 * 3600;
    royalty = 1000;

    deployed_contract = await upgrades.deployProxy(
      phantaSpace_contract,
      [metadataURL, contractURI, vendingPrice, auctionDuration, royalty],
      { kind: "uups" }
    );

    console.log("deployed_contract :", deployed_contract.address);
  });

  describe("Deployment", function () {
    it("should set the right owner", async function () {
      expect(await deployed_contract.owner()).to.equal(owner.address);
    });

    it("should return contractURI", async function () {
      const contractURI = await deployed_contract.contractURI();
      console.log("contractURI :", contractURI);
      expect(contractURI).to.equal("https://phantaspace.com/contract/");
    });
  });

  describe("vending", function () {
    it("should vend space tokens", async function () {
      await deployed_contract.vending({
        value: ethers.utils.parseEther("0.01"),
      });
    });
  });

  describe("genesisAuction", function () {
    let geocode = 3130710591;
    it("should start a genesis auction", async function () {
      await deployed_contract.genesisAuction(geocode, {
        value: ethers.utils.parseEther("0.01"),
      });

      const actionTime = await deployed_contract.auctionStartTime(geocode);
      console.log("actionTime :", actionTime);

      await network.provider.send("evm_increaseTime", [14 * 3600]);

      await deployed_contract.connect(addr1).bid(geocode, {
        value: ethers.utils.parseEther("0.02"),
      });

      await network.provider.send("evm_increaseTime", [14 * 3600]);

      await deployed_contract.genesisAuctionEnd(geocode);

      await deployed_contract.withdraw(geocode);

      console.log(addr1.address);
      const balance = await deployed_contract.balanceOf(addr1.address);
      console.log("balance :", balance);

      const contractBalance = await waffle.provider.getBalance(deployed_contract.address);

      console.log("contractBalance :", contractBalance);
      const NFTowner = await deployed_contract.ownerOf(geocode);
      console.log("NFT owner :", NFTowner);
      expect(NFTowner).to.equal(addr1.address);

      //put subspace to auction
      await deployed_contract.connect(addr1).putSubspaceToAuciton(geocode);
    });
  });

  describe("safeMint", function () {
    const geocode = 3130710591;

    it("should mint a space token", async function () {
      await deployed_contract.safeMint(addr1.address, geocode);
      const NFTowner = await deployed_contract.ownerOf(geocode);
      console.log("NFT owner :", NFTowner);
      const exist = await deployed_contract.exists(geocode);
      console.log(exist);
      expect(NFTowner).to.equal(addr1.address);
      const tokenURI = await deployed_contract.tokenURI(geocode);
      console.log("tokenURI :", tokenURI);
    });
  });
});
