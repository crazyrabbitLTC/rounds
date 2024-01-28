export function roundStatusToString(status: bigint): string {
  const RoundStatus: { [key: number]: string } = {
    0: "DOES_NOT_EXIST",
    1: "PENDING",
    2: "ACTIVE",
    3: "ENDED",
    4: "FINALIZED",
  };
  return RoundStatus[parseInt(status.toString())] || "Unknown";
}

export function candidateStatusToString(status: bigint): string {
  const CandidateStatus: { [key: number]: string } = {
    0: "UNREGISTERED",
    1: "REGISTERED",
    2: "ELIMINATED",
  };
  return CandidateStatus[parseInt(status.toString())] || "Unknown";
}
