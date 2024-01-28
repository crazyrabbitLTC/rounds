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
import { deployMedianVoteFixture } from "../MedianVote";

export function shouldManageRounds(): void {
  describe("Round Management", function () {
    it("should have an initial round status of DOES_NOT_EXIST", async function () {
      const { medianVote } = await loadFixture(deployMedianVoteFixture);
      const status = await medianVote.getRoundStatus(0);
      expect(roundStatusToString(status)).to.equal("DOES_NOT_EXIST");
    });

    it("should have an status PENDING when first started and delay has not elapsed ", async function () {
      const { medianVote } = await loadFixture(deployMedianVoteFixture);

      // start round
      await medianVote.startNextRound();
      const currentRound = await medianVote.getCurrentRoundIndex();
      const status = await medianVote.getRoundStatus(currentRound);
      expect(roundStatusToString(status)).to.equal("PENDING");
    });

    it("should have a round status of ACTIVE after starting a round and passing delay", async function () {
      const { medianVote, oneMinuteInSeconds, roundDelay } = await loadFixture(
        deployMedianVoteFixture
      );
      await medianVote.startNextRound();
      const currentRound = await medianVote.getCurrentRoundIndex();

      // increment time
      await time.increase(roundDelay + 1);
      const status = await medianVote.getRoundStatus(currentRound);

      // Depending on your roundDelay setup, adjust the expected status
      expect(roundStatusToString(status)).to.equal("ACTIVE");
    });

    it("should have a round status of ENDED after the round duration passes", async function () {
      const { medianVote, oneMinuteInSeconds, roundDuration, roundDelay } =
        await loadFixture(deployMedianVoteFixture);
      await medianVote.startNextRound();
      // Simulate time passage
      await time.increase(roundDuration + roundDelay + 1);

      const currentRound = await medianVote.getCurrentRoundIndex();
      const status = await medianVote.getRoundStatus(currentRound);
      expect(roundStatusToString(status)).to.equal("ENDED");
    });
  });
}
