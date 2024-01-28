// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { MedianVote } from "../MedianVote.sol";

contract OnchainMedianCalculation is MedianVote {
    // State variable to store votes for each round in a sorted manner
    mapping(uint256 => uint256[]) private sortedVotesPerRound;

    // Override castVote to insert votes in sorted order
    function castVote(address candidate, uint256 voteAmount) public payable override {
        uint256 currentRoundIndex = getCurrentRoundIndex();
        insertInSortedOrder(sortedVotesPerRound[currentRoundIndex], voteAmount);
        super.castVote(candidate, voteAmount);
    }

    // Override finalizeRound to use the sorted array for median calculation
    function finalizeRound(uint256 /* threshold */) public payable override {
        uint256 currentRoundIndex = getCurrentRoundIndex();
        uint256 median = computeMedian(sortedVotesPerRound[currentRoundIndex]);
        super.finalizeRound(median);
    }

    // Insert a vote in the sorted array in the correct position
    function insertInSortedOrder(uint256[] storage array, uint256 value) internal {
        int index = findInsertionIndex(array, value);
        array.push(value); // Append at the end, to be swapped into place

        // Move elements to right to create space for new value
        for (int i = int(array.length - 1); i > index; i--) {
            array[uint(i)] = array[uint(i - 1)];
        }
        array[uint(index)] = value; // Insert the value at the correct position
    }

    // Find the correct index to insert a new value in the sorted array
    function findInsertionIndex(uint256[] storage array, uint256 value) internal view returns (int) {
        int low = 0;
        int high = int(array.length) - 1;

        while (low <= high) {
            int mid = (low + high) / 2;
            if (array[uint(mid)] < value) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return low; // The correct position for the new value
    }

    // Compute the median of the sorted array
    function computeMedian(uint256[] storage array) internal view returns (uint256) {
        uint256 middle = array.length / 2;
        if (array.length % 2 != 0) {
            return array[middle]; // Odd number of elements
        } else {
            return (array[middle - 1] + array[middle]) / 2; // Even number, take average of middle two
        }
    }
}
