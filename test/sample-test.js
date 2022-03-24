const { expect } = require("chai");
const { base64 } = require("ethers/lib/utils");
const { ethers, upgrades } = require("hardhat");

describe("PhantaSpace", function () {
  // test uint256 slice function
  it("Deploy test", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const PhantaSpace = await ethers.getContractFactory("PhantaSpace");

    console.log("deploying PhantaSpace");
    const precision = 1;
    const imageURL = "https://phanta.space/#/NFT/space/";
    const animationURL = "https://phanta.space/#/NFT/space/";
    const externalURL = "https://phanta.space/#/space/";
    const vendingPrice = ethers.utils.parseEther("0.08");
    const auctionDuration = 24 * 3600;
    const royalty = 10000;
    // const contractURI =
    //   "data:application/json;base64," +
    //   base64.encode(
    //     "{" +
    //       '"name": "PhantaSpace"' +
    //       '"description": "Your own space in PhantaSpace",' +
    //       '"image": "https://phanta.space/favicon.svg",' +
    //       '"external_link": "https://phanta.space",' +
    //       '"seller_fee_basis_points": 10000,' +
    //       '"fee_recipient": "' +
    //       owner.address +
    //       '"' +
    //       "}"
    //   );
    // const contractURI = "data:application/json;base64,";
    const phantaSpace = await PhantaSpace.deploy(
      precision,
      imageURL,
      animationURL,
      externalURL,
      vendingPrice,
      auctionDuration,
      royalty
    );
    await phantaSpace.deployed();
    console.log("phantaSpace deployed to :", phantaSpace.address);

    const theOwner = await phantaSpace.owner();
    console.log("Owner address :", theOwner);

    const contractAddresss = await phantaSpace.address;
    console.log("Contract address :", contractAddresss);

    const vending = await phantaSpace.vending({
      value: ethers.utils.parseEther("0.01"),
    });
    console.log("random :", vending);

    await phantaSpace.genesisAuction(3130710591, {
      value: ethers.utils.parseEther("0.01"),
    });
    await network.provider.send("evm_increaseTime", [14 * 3600]);

    await phantaSpace.connect(addr1).bid(3130710591, {
      value: ethers.utils.parseEther("0.02"),
    });

    await network.provider.send("evm_increaseTime", [14 * 3600]);

    await phantaSpace.auctionEnd(3130710591);

    console.log(addr1.address);
    const NFTowner = await phantaSpace.ownerOf(3130710591);
    console.log("NFT owner :", NFTowner);

    // const newAuction = await phantaSpace.newAuction();
    // console.log("newAuction :", newAuction);
    // const result = await phantaSpace.mint(3130710591);

    // const contractURI = await phantaSpace.contractURI();
    // console.log(contractURI);

    // const subspace = await phantaSpace.mintSubspace(3130710591, 9, 9, 9);
    // console.log(subspace);

    const tokenURI = await phantaSpace.tokenURI(3130710591);
    console.log("=========================", tokenURI);

    // await phantaSpace.setBaseURL("https://phanta.space/#/");

    // const newtokenURI = await phantaSpace.tokenURI(3130710591);
    // console.log("=========================", newtokenURI);

    // let mnemonic = "";
    // let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
    // console.log("==========================");
    // console.log(mnemonicWallet.privateKey);
  });
});

describe("MyToken", function () {
  it("deploys", async function () {
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

    // console.log("newContract :", newContract);
  });
});
