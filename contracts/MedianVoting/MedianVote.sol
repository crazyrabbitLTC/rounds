// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MedianVoteBase} from "./MedianVoteBase.sol";

contract MedianVote is MedianVoteBase {
    error RegistrationClosed();

    function initialize(
        uint256 roundDuration,
        uint256 roundDelay
    ) public virtual initializer {
        MedianVoteBase.__MedianVoteBaseInit(roundDuration, roundDelay);
    }

    function registerCandidate() public payable virtual {
        // Block a user from registering after a vote has started
        if (_getContestStatus() != ContestStatus.PENDING) revert RegistrationClosed();

        _registerCandidate(msg.sender);
    }

    function startNextRound() public payable virtual {
        _startNextRound();
    }

    function castVote(
        address candidate,
        uint256 voteAmount
    ) public payable virtual {
        // Get the last round index
        uint256 _roundIndex = _getCurrentRoundIndex();
        uint256 previousRound = _roundIndex == 0 ? 0 : _roundIndex - 1;

        // Require the candidate to be registered
        if (
            _getCandidateStatus(candidate, previousRound) !=
            CandidateStatus.REGISTERED
        ) revert InvalidCandidate();

        // Require the voter to be registered
        if (
            _getCandidateStatus(msg.sender, previousRound) !=
            CandidateStatus.REGISTERED
        ) revert InvalidVoter();

        _castVote(msg.sender, candidate, voteAmount);
    }

    function getCandidateStatus(
        address candidate,
        uint256 round
    ) public view virtual returns (CandidateStatus) {
        return _getCandidateStatus(candidate, round);
    }

    function getRoundStatus(
        uint256 round
    ) public view virtual override returns (RoundStatus) {
        return _getRoundStatus(round);
    }

    function finalizeRound(uint256 threshold) public payable virtual {
        _finalizeRound(threshold);
    }
}
