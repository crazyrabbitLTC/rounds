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


// TODO: Make these tests more concise
export function shouldHandleMedianThreshold(): void {
  describe("Median Threshold Elimination Tests", function () {
    let medianVote: MedianVote;
    let candidate1: SignerWithAddress,
      candidate2: SignerWithAddress,
      candidate3: SignerWithAddress;
    let roundDelay: number, roundDuration: number;

    beforeEach(async function () {
      // Deploy and initialize as before
      const fixture = await loadFixture(deployMedianVoteFixture);
      medianVote = fixture.medianVote;
      candidate1 = fixture.candidate1;
      candidate2 = fixture.candidate2;
      candidate3 = fixture.candidate3;
      roundDelay = fixture.roundDelay;
      roundDuration = fixture.roundDuration;

      // Register candidates
      await medianVote.connect(candidate1).registerCandidate();
      await medianVote.connect(candidate2).registerCandidate();
      await medianVote.connect(candidate3).registerCandidate();
    });


    

    it("should handle multiple rounds with proper eliminations", async function () {
      // Test setup: votes for candidates in each round
      const votesPerRound = [
          [5, 10, 15], // Round 0
          [7, 10, 0],  // Round 1
          [3, 0, 0],   // Round 2
      ];
      const medianThresholds = [11, 8, 4]; // Median thresholds for each round
  
      for (let round = 0; round < votesPerRound.length; round++) {
          await medianVote.startNextRound();
          await time.increase(roundDelay + 1);
  
          // Cast votes
          for (let i = 0; i < 3; i++) {
              if (votesPerRound[round][i] > 0) {
                  await medianVote
                      .connect([candidate1, candidate2, candidate3][i])
                      .castVote([candidate1, candidate2, candidate3][i].address, votesPerRound[round][i]);
              }
          }
  
          // Finalize round
          await time.increase(roundDelay + roundDuration + 1);
          await medianVote.finalizeRound(medianThresholds[round]);
  
          // Check candidate statuses
          for (let i = 0; i < 3; i++) {
              const status = candidateStatusToString(
                  await medianVote.getCandidateStatus([candidate1, candidate2, candidate3][i].address, round)
              );
  
              let expectedStatus;
  
              // Status expectations based on round and vote counts
              if (round === 0) {
                  expectedStatus = "REGISTERED"; // All candidates are registered
              } else if (round === 1) {
                  expectedStatus = (i === 0 || i === 1) ? "REGISTERED" : "ELIMINATED"; // Candidate3 eliminated
              } else {
                  expectedStatus = (i === 0) ? "REGISTERED" : "ELIMINATED"; // Candidate2 and Candidate3 eliminated
              }
  
              expect(status).to.equal(expectedStatus, `Round ${round}, Candidate ${i}`);
          }
      }
  });
  

    // Additional test cases for different scenarios...
  });
}
