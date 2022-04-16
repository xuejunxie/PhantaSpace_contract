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
    auctionFloor = ethers.utils.parseEther("0.25");
    auctionDuration = 24 * 3600;
    royalty = 1000;

    deployed_contract = await upgrades.deployProxy(
      phantaSpace_contract,
      [metadataURL, contractURI, vendingPrice, auctionFloor, auctionDuration, royalty],
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
      const vending = await deployed_contract.vending(3, {
        value: ethers.utils.parseEther("0.01"),
      });

      const vendingReceipt = await vending.wait();

      const vendingEvents = await vendingReceipt.events;

      vendingEvents.map((event) => {
        if (event.event == "SpaceMinted") {
          console.log("geocode", event.args.geocode);
        }
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
        value: ethers.utils.parseEther("0.25"),
      });

      const auctionEndTime1 = await deployed_contract.auctionEndTime(geocode);
      console.log("auctionEndTime :", auctionEndTime1);

      await network.provider.send("evm_increaseTime", [14 * 3600]);

      const balance0 = await waffle.provider.getBalance(addr1.address);
      console.log("balance :", balance0);

      await deployed_contract.connect(addr1).bid(geocode, {
        value: ethers.utils.parseEther("0.3"),
      });

      await network.provider.send("evm_increaseTime", [10 * 3600 - 60]);

      await deployed_contract.connect(addr2).bid(geocode, {
        value: ethers.utils.parseEther("0.4"),
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
      await deployed_contract.withdraw(geocode);
      // await deployed_contract.connect(addr1).withdraw(geocode);

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
      await deployed_contract.connect(addr2).mintSubspace(geocode, 1, 1, 1);
      const childGeocode = 313070105902;
      const contractBalance2 = await waffle.provider.getBalance(deployed_contract.address);
      console.log("contractBalance :", contractBalance2);
      await deployed_contract.genesisAuction(childGeocode, {
        value: ethers.utils.parseEther("0.25"),
      });
      await network.provider.send("evm_increaseTime", [49 * 3600]);
      await deployed_contract.genesisAuctionEnd(childGeocode);
      const contractBalance3 = await waffle.provider.getBalance(deployed_contract.address);
      console.log("contractBalance :", contractBalance3);
      await deployed_contract.ownerWithdraw(contractBalance3);
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

  describe("test parent function", function () {
    const childGeocode = 313070105902;
    const parentGeocode = 3130710591;
    it("should return the right parent geocode", async function () {
      const parent = await deployed_contract.parent(childGeocode);
      console.log(parent);
      expect(parent).to.equal(parentGeocode);
    });
  });

  describe("checnGeocode", function () {
    const geocode = 3130710591;
    it("should check the geocode", async function () {
      const result = await deployed_contract.safeMint(owner.address, geocode);

      const events = await result.wait();

      const args = await events.events[0].args;
      console.log(args);
    });
  });

  describe("pause", function () {
    const geocode = 3130710591;

    it("should mint a space token", async function () {
      await deployed_contract.pause();
      await deployed_contract.unpause();
    });
  });
});
