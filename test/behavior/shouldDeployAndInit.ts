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
} from "../MedianVoteUtils";
import { MedianVote } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Signer } from "ethers";

export function shouldDeployAndInitializeContract() {
  describe("Deplyment and initialization", function () {
    it("should deploy and initialize contract", async function () {
      const [deployer, voter1, voter2, candidate1, candidate2] =
        await ethers.getSigners();
      const MedianVote = await ethers.getContractFactory("MedianVote");
      const medianVote = await MedianVote.deploy();
      const oneMinuteInSeconds: number = 1 * 60;
      const roundDuration: number = oneMinuteInSeconds;
      const roundDelay: number = oneMinuteInSeconds;

      // call initalizer
      await expect(medianVote.initialize(roundDuration, roundDelay)).to.emit(
        medianVote,
        "Initialized"
      );
    });

    it("should deploy and initialize contract with correct values", async function () {
      const [deployer, voter1, voter2, candidate1, candidate2] =
        await ethers.getSigners();
      const MedianVote = await ethers.getContractFactory("MedianVote");
      const medianVote = await MedianVote.deploy();
      const oneMinuteInSeconds: number = 1 * 60;

      // call initalizer
      await expect(
        medianVote.initialize(oneMinuteInSeconds, oneMinuteInSeconds)
      ).to.emit(medianVote, "Initialized");

      // check values
      expect(await medianVote.getRoundDuration()).to.equal(oneMinuteInSeconds);
      expect(await medianVote.getRoundDelay()).to.equal(oneMinuteInSeconds);
    });
    it("should deploy and initialize contract only once", async function () {
      const [deployer, voter1, voter2, candidate1, candidate2] =
        await ethers.getSigners();
      const MedianVote = await ethers.getContractFactory("MedianVote");
      const medianVote = await MedianVote.deploy();
      const oneMinuteInSeconds: number = 1 * 60;

      // call initalizer
      await expect(
        medianVote.initialize(oneMinuteInSeconds, oneMinuteInSeconds)
      ).to.emit(medianVote, "Initialized");
      // call initalizer
      await expect(
        medianVote.initialize(oneMinuteInSeconds, oneMinuteInSeconds)
      ).to.be.reverted;
    });
  });
}
