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
  let maximumSupply;

  beforeEach(async function () {
    phanton_contract = await ethers.getContractFactory("Phanton");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    maximumSupply = 10000000000;

    deployed_contract = await upgrades.deployProxy(phanton_contract, [maximumSupply], { kind: "uups" });

    console.log("Phanton deployed_contract:", deployed_contract.address);

    const totalSupply = await deployed_contract.totalSupply();

    // console.log("totalSupply ", totalSupply);

    await deployed_contract.approve(addr1.address, totalSupply);
  });

  describe("Deployment", function () {
    it("should set the right owner", async function () {
      expect(await deployed_contract.owner()).to.equal(owner.address);
    });
  });

  describe("Seed sale", function () {
    it("should sell to sender", async function () {
      // make addr1 rich
      await network.provider.send("hardhat_setBalance", [addr1.address, "0x10000000000000000000000000"]);
      const buy = await deployed_contract.connect(addr1).seedSale({
        value: ethers.utils.parseEther("1000000"),
      });

      await network.provider.send("hardhat_setBalance", [addr2.address, "0x10000000000000000000000000"]);
      const buy2 = await deployed_contract.connect(addr2).seedSale({
        value: ethers.utils.parseEther("1000000"),
      });

      // console.log(buyReceipt);
      // const buyEvents = await buyReceipt.events;
    });
  });

  describe("Owner mint", function () {
    it("should mint", async function () {
      // make addr1 rich
      const mint = await deployed_contract.mint(owner.address, "1000");

      // console.log(buyReceipt);
      // const buyEvents = await buyReceipt.events;
    });
  });

  describe("Upgrade", function () {
    it("should upgrade", async function () {
      const PhantonV2 = await ethers.getContractFactory("PhantonV2");
      const upgraded = await upgrades.upgradeProxy(deployed_contract.address, PhantonV2);
      console.log("upgrade address : ", upgraded.address);
    });
  });
});
