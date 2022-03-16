module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  log("Deploying PhantaSpace==========");
  const PhantaSpace = await deploy("PhantaSpace", {
    from: deployer,
    log: true,
    args: [1],
  });
  log("PhantaSpace deployed to :", PhantaSpace.address);
};
