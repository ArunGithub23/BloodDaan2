// migrations/2_deploy_contract.js

const BloodDaan = artifacts.require("Bloodtoken");

module.exports = function(deployer) {
  deployer.deploy(BloodDaan);
};
