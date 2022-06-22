const { expect } = require("chai");
const { ethers, upgrades, network, waffle } = require("hardhat");
const { networks } = require("../hardhat.config");

describe("Phanton", function () {
  let phanton_contract;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let deployed_contract;

  beforeEach(async function () {
    phanton_contract = await ethers.getContractFactory("Phanton");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    deployed_contract = await upgrades.deployProxy(phanton_contract, [], { kind: "uups" });

    console.log("Phanton deployed_contract:", deployed_contract.address);
  });

  describe("Deployment", function () {
    it("should set the right owner", async function () {
      expect(await deployed_contract.owner()).to.equal(owner.address);
    });
  });
});
