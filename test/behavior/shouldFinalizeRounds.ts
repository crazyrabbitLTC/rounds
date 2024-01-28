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
import { deployMedianVoteFixture } from "../MedianVote";

export function shouldFinalizeRounds(): void {
    describe("Round Finalization and Candidate Status", function () {
        it("should finalize a round and set median threshold", async function () {
          const { medianVote, candidate1, roundDelay, roundDuration } = await loadFixture(deployMedianVoteFixture);
          
          // Register candidate
          await medianVote.connect(candidate1).registerCandidate();
          // Start and progress the round
          await medianVote.startNextRound();
          await time.increase(roundDelay + 1);
          await medianVote.connect(candidate1).castVote(candidate1.address, 5);
          await time.increase(roundDelay + roundDuration + 1);

          // Finalize round with a specific threshold
          await medianVote.finalizeRound(5);
          expect(roundStatusToString(await medianVote.getRoundStatus(0))).to.equal("FINALIZED");
        });

        it("should correctly determine candidate status after round finalization", async function () {
          const { medianVote, candidate1, candidate2, roundDelay, roundDuration } = await loadFixture(deployMedianVoteFixture);
          await medianVote.connect(candidate1).registerCandidate();
          await medianVote.connect(candidate2).registerCandidate();

          // Start and progress the round
          await medianVote.startNextRound();
          await time.increase(roundDelay + 1);
          await medianVote.connect(candidate1).castVote(candidate1.address, 10);
          await medianVote.connect(candidate2).castVote(candidate2.address, 3);
          await time.increase(roundDelay + roundDuration + 1);

          // Finalize round with a specific threshold
          await medianVote.finalizeRound(5);

          // Candidate1 should be registered, and Candidate2 eliminated
          expect(candidateStatusToString(await medianVote.getCandidateStatus(candidate1.address, 1))).to.equal("ELIMINATED");
          expect(candidateStatusToString(await medianVote.getCandidateStatus(candidate2.address, 1))).to.equal("REGISTERED");
        });

        // Additional tests for checking status in different scenarios
        // ...
      });
}
