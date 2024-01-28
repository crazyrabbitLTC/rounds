
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:deployContest")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signers = await ethers.getSigners();
    const rounds_Factory = await ethers.getContractFactory("RoundsBase");
    const contest = await rounds_Factory.connect(signers[0]).deploy();
    await contest.waitForDeployment();
    console.log("contest deployed to: ", await contest.getAddress());
  });

  task("task:deployContest")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signers = await ethers.getSigners();
    const rounds_Factory = await ethers.getContractFactory("RoundsBase");
    const contest = await rounds_Factory.connect(signers[0]).deploy();
    await contest.waitForDeployment();
    console.log("contest deployed to: ", await contest.getAddress());
  });