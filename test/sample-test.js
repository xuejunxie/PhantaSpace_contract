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
    const phantaSpace = await PhantaSpace.deploy(precision, baseURL);
    await phantaSpace.deployed();
    console.log("phantaSpace deployed to :", phantaSpace.address);

    const theOwner = await phantaSpace.owner();
    console.log("Owner address :", theOwner);

    const result = await phantaSpace.mint(3130710591);

    // const contractURI = await phantaSpace.contractURI();
    // console.log(contractURI);

    const subspace = await phantaSpace.mintSubspace(3130710591, 9, 9, 9);
    console.log(subspace);

    const tokenURI = await phantaSpace.tokenURI(3130710591);
    console.log("=========================", tokenURI);

    await phantaSpace.setBaseURL("https://phanta.space/#/");

    const newtokenURI = await phantaSpace.tokenURI(3130710591);
    console.log("=========================", newtokenURI);

    // let mnemonic = "";
    // let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
    // console.log("==========================");
    // console.log(mnemonicWallet.privateKey);
  });
});
