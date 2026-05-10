const GemstoneRegistry = artifacts.require("GemstoneRegistry");

module.exports = function(deployer) {
  deployer.deploy(GemstoneRegistry);
};