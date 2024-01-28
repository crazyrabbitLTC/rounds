import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "./tasks/deploy";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
};

export default config;
