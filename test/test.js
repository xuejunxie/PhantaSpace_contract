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
    vendingPrice = ethers.utils.parseEther("0.001");
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
        value: ethers.utils.parseEther("0.001"),
      });

      // const NFT_numbers = await deployed_contract.balanceOf(owner.address);
      // for (let i = 0; i < NFT_numbers; i++) {
      //   const NFT = await deployed_contract.tokenOfOwnerByIndex(owner.address, i);
      //   console.log("NFT :", NFT);
      // }
    });
  });

  describe("genesisAuction", function () {
    let geocode = 3130710591;
    it("should start a genesis auction", async function () {
      await deployed_contract.genesisAuction(geocode, {
        value: ethers.utils.parseEther("0.1"),
      });

      const auctionEndTime1 = await deployed_contract.auctionEndTime(geocode);
      console.log("auctionEndTime :", auctionEndTime1);

      await network.provider.send("evm_increaseTime", [14 * 3600]);

      const balance0 = await waffle.provider.getBalance(addr1.address);
      console.log("balance :", balance0);

      await deployed_contract.connect(addr1).bid(geocode, {
        value: ethers.utils.parseEther("0.2"),
      });

      await network.provider.send("evm_increaseTime", [10 * 3600 - 60]);

      await deployed_contract.connect(addr2).bid(geocode, {
        value: ethers.utils.parseEther("0.3"),
      });

      await network.provider.send("evm_increaseTime", [25 * 3600]);

      const blocknNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blocknNumber);
      const blockTimestamp = block.timestamp;

      console.log("blockTimestamp :", blockTimestamp);

      const auctionEndTime2 = await deployed_contract.auctionEndTime(geocode);
      console.log("auctionEndTime :", auctionEndTime2);
      expect(parseInt(auctionEndTime2)).to.equal(parseInt(auctionEndTime1) + 10 * 60);

      await deployed_contract.genesisAuctionEnd(geocode);

      const balance1 = await waffle.provider.getBalance(addr1.address);
      console.log("balance :", balance1);

      const pendinReturn = await deployed_contract.pendingReturns(geocode, addr1.address);
      console.log("pendinReturn :", pendinReturn);

      const withdrawResult = await deployed_contract.connect(addr1).withdraw(geocode);

      const balance2 = await waffle.provider.getBalance(addr1.address);
      console.log("balance :", balance2);

      const contractBalance = await waffle.provider.getBalance(deployed_contract.address);

      console.log("contractBalance :", contractBalance);
      const NFTowner = await deployed_contract.ownerOf(geocode);
      console.log("NFT owner :", NFTowner);
      expect(NFTowner).to.equal(addr2.address);

      //put subspace to auction
      await deployed_contract.connect(addr2).putSubspaceToAuciton(geocode);
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
