const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

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

    imageURL = "http://phantaspace.com/thumbnails/";
    animationURL = "https://phanta.space/#/NFT/space/";
    externalURL = "https://phanta.space/#/space/";
    vendingPrice = ethers.utils.parseEther("0.01");
    auctionDuration = 24 * 3600;
    royalty = 1000;

    rawContractURI = {
      name: "PhantaSpace",
      description: "PhantaSpace is an earth scale metaverse.",
      image: "https://phanta.space/favicon.gif",
      external_link: "https://phanta.space",
      seller_fee_basis_points: royalty,
      fee_recipient: owner.address,
    };

    encodedContractURI = "data:application/json;base64," + btoa(JSON.stringify(rawContractURI));

    deployed_contract = await upgrades.deployProxy(
      phantaSpace_contract,
      [imageURL, animationURL, externalURL, vendingPrice, auctionDuration, royalty, encodedContractURI],
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
      expect(contractURI).to.equal(encodedContractURI);
    });

    it("should update contractURI", async function () {
      rawContractURI = {
        name: "PhantaSpace",
        description: "Your own space in PhantaSpace",
        image: "https://phanta.space/favicon.png",
        external_link: "https://phanta.space",
        seller_fee_basis_points: royalty,
        fee_recipient: owner.address,
      };

      encodedContractURI = "data:application/json;base64," + btoa(JSON.stringify(rawContractURI));

      await deployed_contract.setContractURI(encodedContractURI);

      expect(await deployed_contract.contractURI()).to.equal(encodedContractURI);
    });
  });

  describe("vending", function () {
    it("should vend space tokens", async function () {
      await deployed_contract.vending({
        value: ethers.utils.parseEther("0.1"),
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

      await deployed_contract.withdraw(geocode);

      await network.provider.send("evm_increaseTime", [14 * 3600]);

      await deployed_contract.auctionEnd(geocode);

      console.log(addr1.address);
      const NFTowner = await deployed_contract.ownerOf(geocode);
      console.log("NFT owner :", NFTowner);
      expect(NFTowner).to.equal(addr1.address);
    });

    it("should return tokenURI", async function () {
      let geocode = 3130710591;
      const tokenURI = await deployed_contract.tokenURI(geocode);
      console.log("tokenURI :", tokenURI);
    });
  });

  describe("safeMint", function () {
    it("should mint a space token", async function () {
      const geocode = 3130710591;
      await deployed_contract.safeMint(addr1.address, geocode);
      const NFTowner = await deployed_contract.ownerOf(geocode);
      console.log("NFT owner :", NFTowner);
      expect(NFTowner).to.equal(addr1.address);
    });
  });
});
