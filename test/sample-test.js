const { expect } = require("chai");
const { base64 } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe("PhantaSpace", function () {
  // test uint256 slice function
  it("Should return the correct slice of the uint256", async function () {
    const PhantaSpace = await ethers.getContractFactory("PhantaSpace");

    console.log("deploying PhantaSpace");
    const precision = 1;
    const phantaSpace = await PhantaSpace.deploy(precision);
    await phantaSpace.deployed();
    console.log("phantaSpace deployed to :", phantaSpace.address);

    const theOwner = await phantaSpace.owner();
    console.log("Owner address :", theOwner);

    const result = await phantaSpace.mint(3130710591);
    const tokenURI = await phantaSpace.tokenURI(3130710591);
    console.log(tokenURI);

    const contractURI = await phantaSpace.contractURI();
    console.log(contractURI);
  });
});
