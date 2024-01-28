// test/OnchainMedianCalculationTest.js

import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { OnchainMedianCalculation } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { candidateStatusToString } from "./MedianVoteUtils";

export async function deployOnchainMedianCalculationFixture() {
    const [deployer, voter1, voter2, candidate1, candidate2, candidate3] =
        await ethers.getSigners();
    const OnchainMedianCalculationFactory = await ethers.getContractFactory("OnchainMedianCalculation");
    const onchainMedian = await OnchainMedianCalculationFactory.deploy();
    const oneMinuteInSeconds = 60;
    const roundDuration = oneMinuteInSeconds;
    const roundDelay = oneMinuteInSeconds;

    await onchainMedian.initialize(roundDuration, 0);

    await onchainMedian.connect(candidate1).registerCandidate();
    await onchainMedian.connect(candidate2).registerCandidate();
    await onchainMedian.connect(candidate3).registerCandidate();

    return {
        onchainMedian,
        deployer,
        voter1,
        voter2,
        candidate1,
        candidate2,
        candidate3,
        roundDuration,
        roundDelay,
    };
}

describe("OnchainMedianCalculation", function () {
    let onchainMedian: OnchainMedianCalculation, candidate1: SignerWithAddress, candidate2: SignerWithAddress, candidate3: SignerWithAddress, roundDuration: number, roundDelay: number;

    beforeEach(async function () {
        ({ onchainMedian, candidate1, candidate2, candidate3, roundDuration, roundDelay } = await loadFixture(deployOnchainMedianCalculationFixture));
    });

    xit("should track votes per round correctly", async function () {
        await onchainMedian.startNextRound();
        await onchainMedian.connect(candidate1).castVote(candidate1.address, 5);
        await onchainMedian.connect(candidate2).castVote(candidate2.address, 10);

        const votes = await onchainMedian.getVotesForRound(0);
        expect(votes).to.deep.equal([5, 10]);
    });

    it("should calculate median correctly on round finalization", async function () {
        await onchainMedian.startNextRound();
        await onchainMedian.connect(candidate1).castVote(candidate1.address, 5);
        await onchainMedian.connect(candidate2).castVote(candidate2.address, 10);
        await onchainMedian.connect(candidate3).castVote(candidate3.address, 15);

        await time.increase(roundDelay + roundDuration);
        await onchainMedian.finalizeRound(0); // The threshold parameter is ignored in overridden function
        const roundInfo = await onchainMedian.rounds(0);
        expect(roundInfo.medianThreshold).to.equal(10); // The median should be 10
    });

    it("should update candidate statuses correctly after round finalization", async function () {
        await onchainMedian.startNextRound();
        await onchainMedian.connect(candidate1).castVote(candidate1.address, 5);
        await onchainMedian.connect(candidate2).castVote(candidate2.address, 10);
        await time.increase(roundDelay + roundDuration);
        await onchainMedian.finalizeRound(0);

        //we have to start another round to get the candidate status from previous round outcome
        await onchainMedian.startNextRound();



        const statusCandidate1 = await onchainMedian.getCandidateStatus(candidate1.address, 1);
        const statusCandidate2 = await onchainMedian.getCandidateStatus(candidate2.address, 1);
        expect(candidateStatusToString(statusCandidate1)).to.equal("REGISTERED");
        expect(candidateStatusToString(statusCandidate2)).to.equal("ELIMINATED");
    });
});
