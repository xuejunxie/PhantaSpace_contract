const { expect } = require("chai");
const { base64 } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe("PhantaSpace", function () {
  // test uint256 slice function
  it("Deploy test", async function () {
    const PhantaSpace = await ethers.getContractFactory("PhantaSpace");

    console.log("deploying PhantaSpace");
    const precision = 1;
    const baseURL = "https://phanta.space/#/NFT/space/";
    const externalURL = "https://phanta.space/#/space/";
    const vendingPrice = ethers.utils.parseEther("0.01");
    const phantaSpace = await PhantaSpace.deploy(precision, baseURL, externalURL, vendingPrice);
    await phantaSpace.deployed();
    console.log("phantaSpace deployed to :", phantaSpace.address);

    const theOwner = await phantaSpace.owner();
    console.log("Owner address :", theOwner);

    const contractAddresss = await phantaSpace.address;
    console.log("Contract address :", contractAddresss);

    const vending = await phantaSpace.vending({
      value: ethers.utils.parseEther("0.1"),
    });
    console.log("random :", vending);

    // const newAuction = await phantaSpace.newAuction();
    // console.log("newAuction :", newAuction);
    const result = await phantaSpace.mint(3130710591);

    // const contractURI = await phantaSpace.contractURI();
    // console.log(contractURI);

    // const subspace = await phantaSpace.mintSubspace(3130710591, 9, 9, 9);
    // console.log(subspace);

    // const tokenURI = await phantaSpace.tokenURI(3130710591);
    // console.log("=========================", tokenURI);

    // await phantaSpace.setBaseURL("https://phanta.space/#/");

    // const newtokenURI = await phantaSpace.tokenURI(3130710591);
    // console.log("=========================", newtokenURI);

    // let mnemonic = "";
    // let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
    // console.log("==========================");
    // console.log(mnemonicWallet.privateKey);
  });
});

// describe("Auction", function () {
//   it("Auction test", async function () {
//     const simpleAuction = await ethers.getContractFactory("SimpleAuction");
//     const auction = await simpleAuction.deploy(1000, "0xc12Fbb46Ebc085DCaaEd8a9b47e5B557B9490233");

//     await auction.deployed();

//     const auctionAddress = await auction.address;
//     console.log("Auction address :", auctionAddress);
//   });
// });
