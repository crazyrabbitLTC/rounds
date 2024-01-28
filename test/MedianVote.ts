import { ethers } from "hardhat";
import { expect } from "chai";
import {
  loadFixture,
  time,
  mine,
} from "@nomicfoundation/hardhat-network-helpers";

import {
  roundStatusToString,
  candidateStatusToString,
} from "./MedianVoteUtils";
import { MedianVote } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Signer } from "ethers";
import { shouldDeployAndInitializeContract } from "./behavior/shouldDeployAndInit";
import { shouldRegister } from "./behavior/shouldRegister";
import { shouldManageRounds } from "./behavior/shouldManageRounds";
import { shouldVote } from "./behavior/shouldDoVoting";
import { shouldHandleMedianThreshold } from "./behavior/shouldHandleMedianThreshold";
import { shouldFinalizeRounds } from "./behavior/shouldFinalizeRounds";

export async function deployMedianVoteFixture() {
  const [deployer, voter1, voter2, candidate1, candidate2, candidate3] =
    await ethers.getSigners();
  const MedianVote = await ethers.getContractFactory("MedianVote");
  const medianVote = await MedianVote.deploy();
  const oneMinuteInSeconds: number = 1 * 60;
  const roundDuration: number = oneMinuteInSeconds;
  const roundDelay: number = oneMinuteInSeconds;

  // call initalizer
  await medianVote.initialize(roundDuration, roundDelay);

  // Additional setup if required
  return {
    medianVote,
    deployer,
    voter1,
    voter2,
    candidate1,
    candidate2,
    candidate3,
    oneMinuteInSeconds,
    roundDuration,
    roundDelay,
  };
}

describe("MedianVote", function () {
  shouldDeployAndInitializeContract();
  shouldRegister();
  shouldManageRounds();
  shouldVote();
  shouldHandleMedianThreshold();
  shouldFinalizeRounds();
});
