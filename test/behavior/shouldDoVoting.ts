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

export function shouldVote(): void {
  describe("Voting", function () {
    it("should allow voting for a registered candidate", async function () {
      const { medianVote, candidate1, oneMinuteInSeconds, roundDelay } =
        await loadFixture(deployMedianVoteFixture);

      // register candidate
      await medianVote.connect(candidate1).registerCandidate();
      // start round
      await medianVote.startNextRound();
      // move time forward by 1 minute
      await time.increase(roundDelay + 1);
      // vote for candidate
      await expect(
        medianVote.connect(candidate1).castVote(candidate1.address, 10)
      )
        .to.emit(medianVote, "VoteCast")
        .withArgs(candidate1.address, candidate1.address, 0, 10);

      // Validate vote count or other relevant assertions
      expect(
        await medianVote.getCandidateVotes(candidate1.address, 0)
      ).to.equal(10);
    });
    // Additional tests for voting logic

    it("should not allow voting for a non-registered candidate", async function () {
      const { medianVote, candidate2 } = await loadFixture(
        deployMedianVoteFixture
      );

      await medianVote.startNextRound();
      await expect(
        medianVote.castVote(candidate2.address, 10)
      ).to.be.revertedWithCustomError(medianVote, "InvalidCandidate"); // Replace with your specific error message
    });

    it("should not allow voting in a pending state", async function () {
      const { medianVote, candidate1, roundDelay, roundDuration } =
        await loadFixture(deployMedianVoteFixture);

      await medianVote.connect(candidate1).registerCandidate();

      await medianVote.startNextRound();

      await expect(
        medianVote.connect(candidate1).castVote(candidate1.address, 10)
      ).to.be.revertedWithCustomError(medianVote, "RoundNotActive"); // Replace with your specific error message
    });

    it("should not allow voting if voter unregistered", async function () {
      const { medianVote, candidate1, candidate2, roundDelay, roundDuration } =
        await loadFixture(deployMedianVoteFixture);

      await medianVote.connect(candidate1).registerCandidate();

      await medianVote.startNextRound();

      await expect(
        medianVote.connect(candidate2).castVote(candidate1.address, 10)
      ).to.be.revertedWithCustomError(medianVote, "InvalidVoter"); // Replace with your specific error message
    });

    it("should not allow voting without an active round", async function () {
      const { medianVote, candidate1, roundDelay, roundDuration } =
        await loadFixture(deployMedianVoteFixture);

      await medianVote.connect(candidate1).registerCandidate();

      await expect(
        medianVote.connect(candidate1).castVote(candidate1.address, 10)
      ).to.be.revertedWithCustomError(medianVote, "RoundNotActive"); // Replace with your specific error message
    });

    it("should handle voting with zero amount", async function () {
      const { medianVote, candidate1, roundDelay, roundDuration } =
        await loadFixture(deployMedianVoteFixture);

      await medianVote.connect(candidate1).registerCandidate();
      await medianVote.startNextRound();

      await time.increase(roundDelay + 1);

      await expect(
        medianVote.connect(candidate1).castVote(candidate1.address, 0)
      )
        .to.emit(medianVote, "VoteCast")
        .withArgs(candidate1.address, candidate1.address, 0, 0);
    });

    it("should not allow voting after the round has ended", async function () {
      const { medianVote, candidate1, roundDelay, roundDuration } =
        await loadFixture(deployMedianVoteFixture);

      await medianVote.connect(candidate1).registerCandidate();
      await medianVote.startNextRound();
      await time.increase(roundDelay + roundDuration + 1); // Assuming the round duration is 1 minute
      await expect(
        medianVote.connect(candidate1).castVote(candidate1.address, 10)
      ).to.be.revertedWithCustomError(medianVote, "RoundNotActive"); // Replace with your specific error message
    });

    describe("Voting across rounds", function () {
      it("should handle multiple rounds of voting (not checking finalization)", async function () {
        const {
          medianVote,
          candidate1,
          voter1,
          voter2,
          oneMinuteInSeconds,
          roundDelay,
          roundDuration,
        } = await loadFixture(deployMedianVoteFixture);

        await medianVote.connect(candidate1).registerCandidate();

        // Round 1
        await medianVote.startNextRound();
        await time.increase(roundDelay + 1);
        await medianVote.connect(candidate1).castVote(candidate1.address, 10);
        await time.increase(roundDelay + roundDuration + 1);
        await medianVote.finalizeRound(15);
        expect(
          await medianVote.getCandidateVotes(candidate1.address, 0)
        ).to.equal(10);

        // Round 2
        await medianVote.startNextRound();
        await time.increase(roundDelay + 1);
        await medianVote.connect(candidate1).castVote(candidate1.address, 20);
        await time.increase(roundDelay + roundDuration + 1);
        await medianVote.finalizeRound(15);
        expect(
          await medianVote.getCandidateVotes(candidate1.address, 1)
        ).to.equal(20);

        // Add assertions for round status and candidate status as necessary
      });

    });
  });
}
