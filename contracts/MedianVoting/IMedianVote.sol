// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMedianVote {
    struct Votes {
        address candidate;
        uint256 amount;
    }

    struct Round {
        uint256 startingTime;
        uint256 startDelay;
        uint256 endingTime;
        uint256 medianThreshold; // this is zero while the round is ongoing
        uint256 votesCast;
        RoundStatus status;
    }

    enum RoundStatus {
        DOES_NOT_EXIST,
        PENDING,
        ACTIVE,
        ENDED,
        FINALIZED
    }

    enum CandidateStatus {
        UNREGISTERED,
        REGISTERED,
        ELIMINATED
    }

    enum ContestStatus {
        PENDING,
        ACTIVE,
        ENDED
    }

    event NewContest(
        address indexed creator,
        uint256 roundDuration,
        uint256 roundDelay
    );

    event ContestEnded();
    event VoteCast(
        address indexed voter,
        address indexed recipient,
        uint256 round,
        uint256 amount
    );
    event CandidateRegistered(address indexed Candidate);
    event NewRound(uint256 round);
    event RoundFinalized(uint256 round, uint256 median);

    error CandidateAlreadyRegistered();
    error PreviousRoundNotFinalized();
    error RoundNotFinalized();
    error RoundAlreadyFinalized();
    error InvalidCandidate();
    error InvalidVoter();
    error InvalidRound();
    error InvalidThreshold();
    error RoundNotActive();
    error ContestFinished();

    // function registerCandidate(address user) external payable;

    function startNextRound() external payable;

    function castVote(address candidate, uint256 voteAmount) external payable;

    function getCandidateStatus(
        address candidate,
        uint256 round
    ) external view returns (CandidateStatus);

    function getRoundStatus(uint256 round) external view returns (RoundStatus);

    function finalizeRound(uint256 threshold) external payable;

    function getRoundDuration() external view returns (uint256);

    function getRoundDelay() external view returns (uint256);

    function getCandidateVotes(
        address _candidate,
        uint256 _round
    ) external view returns (uint256);
    // function castVoteBySig(
    //     address candidate,
    //     uint256 voteAmount,
    //     uint256 deadline,
    //     uint8 v,
    //     bytes32 r,
    //     bytes32 s
    // ) external payable;

    // function registerBySig(
    //     address participant,
    //     uint256 deadline,
    //     uint8 v,
    //     bytes32 r,
    //     bytes32 s
    // ) external payable;
}
