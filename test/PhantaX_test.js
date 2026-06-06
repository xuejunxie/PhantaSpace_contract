const { expect } = require("chai");
const { ethers, upgrades, network, waffle } = require("hardhat");
const { networks } = require("../hardhat.config");

describe("PhantaX", function () {
  let PhantaX_contract;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let deployed_contract;

  beforeEach(async function () {
    PhantaX_contract = await ethers.getContractFactory("PhantaX");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    deployed_contract = await upgrades.deployProxy(PhantaX_contract, [], { kind: "uups" });

    console.log("PhantaX deployed_contract:", deployed_contract.address);
  });

  describe("Deployment", function () {
    it("should set the right owner", async function () {
      expect(await deployed_contract.owner()).to.equal(owner.address);
    });
  });
});
