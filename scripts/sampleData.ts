import { ethers, network } from "hardhat";
import { RoundsBase } from "../typechain-types";

async function runSampleData() {
  // Deploy RoundsBase contract
  const roundsBase = await ethers.deployContract("RoundsBase");
  await roundsBase.waitForDeployment();

  console.log(`RoundsBase deployed to ${roundsBase.target}`);

  // Initialize settings
  const settings = {
    name: "Sample Round",
    admin: (await ethers.getSigners())[0].address,
    metadata: ethers.keccak256(ethers.toUtf8Bytes("Sample Metadata")),
    houseSplit: 50,
    winnerSplit: 50,
    roundDuration: 3600, // 1 hour
    rounds: 10,
    maxRecipientsPerVote: 3,
    allowPublicStartAndEnd: true,
    eliminationNumerator: 10,
    eliminateTop: true,
  };

  await roundsBase.initialize(settings);

  // Register 10 candidates
  const candidates = (await ethers.getSigners()).slice(1, 11); // Assuming you have enough signers
  for (const candidate of candidates) {
    await roundsBase.connect(candidate).register();
  }

  // Function to start a round and cast votes
  const startRoundAndVote = async () => {
    await roundsBase.startNextRound();
    for (const candidate of candidates) {
      // Check if the candidate has been eliminated
      const isCandidateEliminated = await roundsBase.isEliminated(
        candidate.address
      );
    //   if (isCandidateEliminated) {
    //     continue; // Skip voting if the candidate is eliminated
    //   }

      // Filter out eliminated recipients and randomly select recipients for voting
      const validRecipients = candidates.filter(async (c) => {
        return c !== candidate && !(await roundsBase.isEliminated(c.address));
      });

      const recipients = validRecipients
        .sort(() => 0.5 - Math.random())
        .slice(0, settings.maxRecipientsPerVote)
        .map((c) => c.address);
      try {
        await roundsBase.connect(candidate).castVote(recipients);
      } catch (error) {
        console.log("Candidate eliminated, skipping vote", candidate.address);
      }
    }
  };

  // Run three rounds
  for (let i = 0; i < 10; i++) {
    console.log(`Running round ${i + 1}`);
    await startRoundAndVote();

    // Move time forward to end the round
    await network.provider.send("evm_increaseTime", [
      settings.roundDuration + 1,
    ]);
    await network.provider.send("evm_mine");
  }
}

runSampleData().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
