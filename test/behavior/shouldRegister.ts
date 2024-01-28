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

export function shouldRegister(): void {
  describe("Registration", function () {
    it("should allow candidates to register", async function () {
      const { medianVote, candidate1 } = await loadFixture(
        deployMedianVoteFixture
      );
      await medianVote.connect(candidate1).registerCandidate();
      const status = await medianVote.getCandidateStatus(candidate1.address, 0);
      expect(candidateStatusToString(status)).to.equal("REGISTERED");
    });

    it("should not allow candidates to register after rounds started", async function () {
      const { medianVote, candidate1 } = await loadFixture(
        deployMedianVoteFixture
      );
      await medianVote.startNextRound();
      await expect(
        medianVote.connect(candidate1).registerCandidate()
      ).to.be.revertedWithCustomError(medianVote, "RegistrationClosed");
    });

    it("should not allow candidates to register more than once", async function () {
      const { medianVote, candidate1 } = await loadFixture(
        deployMedianVoteFixture
      );

      await medianVote.connect(candidate1).registerCandidate();
      await expect(
        medianVote.connect(candidate1).registerCandidate()
      ).to.be.revertedWithCustomError(medianVote, "CandidateAlreadyRegistered");
    });

    it("should return UNREGISTERED for unregistered candidates", async function () {
      const { medianVote, candidate2 } = await loadFixture(
        deployMedianVoteFixture
      );

      const status = await medianVote.getCandidateStatus(candidate2.address, 0);
      expect(candidateStatusToString(status)).to.equal("UNREGISTERED");
    });

    it("should emit an event when a candidate registers", async function () {
      const { medianVote, candidate1 } = await loadFixture(
        deployMedianVoteFixture
      );

      await expect(medianVote.connect(candidate1).registerCandidate())
        .to.emit(medianVote, "CandidateRegistered")
        .withArgs(candidate1.address);
    });
  });
}
