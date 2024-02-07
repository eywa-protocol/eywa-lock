// SPDX-License-Identifier: UNLICENSED
// Copyright (c) Eywa.Fi, 2021-2023 - all rights reserved
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Locker is Ownable  {

    struct Lock {
        uint256 id;
        address lp;
        uint256 amount;
        uint64 start;
        uint64 duration;
    }
    
    /// @dev allowance of using lp for lock
    mapping(address => bool) public isLpAllowed;
    /// @dev allowance of using lock duration for lp
    mapping(address => mapping(uint64 => bool)) public lockDuration;
    /// @dev user's locks
    mapping(address => Lock[]) public locks;
    /// @dev id of lock by user, user => lock id
    mapping(address => uint256) private _lockId;

    event Locked(address owner, address lp, uint256 amount, uint64 duration);
    event Unlocked(address owner, address lp, uint256 amount, uint64 duration);
    event LpAllowanceSet(address lp, bool isAllowed);
    event LockDurationSet(address lp, uint64 duration, bool isAllowed);
    
    /**
     * @dev Lock amount of lp for duration seconds.
     * 
     * @param lp The addres of lp token to lock;
     * @param amount The amount of input lp token to lock;
     * @param duration The duration of lock in seconds;
     */
    function lock(address lp, uint256 amount, uint64 duration) external {
        require(isLpAllowed[lp], "Locker: LP not allowed");
        require(lockDuration[lp][duration] == true, "Locker: wrong duration");
        Lock memory lock_ = Lock(++_lockId[msg.sender], lp, amount, uint64(block.timestamp), duration);
        locks[msg.sender].push(lock_);
        emit Locked(msg.sender, lp, amount, duration);
        SafeERC20.safeTransferFrom(IERC20(lp), msg.sender, address(this), amount);
    }

    /**
     * @dev Unlock the lock if duration has passed.
     * 
     * @param lockId_ id of the lock;
     */
    function unlock(uint256 lockId_) external {
        (Lock memory lock_, uint256 index) = _findLock(lockId_);
        uint64 duration = lock_.duration;
        uint256 amount = lock_.amount;
        address lp = lock_.lp;
        require((lock_.start + duration) < block.timestamp, "Locker: still locked");
        _deleteLock(index);
        emit Unlocked(msg.sender, lp, amount, duration);
        SafeERC20.safeTransfer(IERC20(lock_.lp), msg.sender, amount);
    }

    /**
     * @dev Allows the token to be used for locking.
     * 
     * @param lp The addres of lp token to allow;
     * @param isAllowed Allowance status for lp token;
     */
    function setLpAllowance(address lp, bool isAllowed) external onlyOwner {
        isLpAllowed[lp] = isAllowed;
        emit LpAllowanceSet(lp, isAllowed);
    }

    /**
     * @dev Sets the time for which lp can be blocked.
     * 
     * @param lp The addres of lp token;
     * @param duration Time for which it will be possible to lock;
     * @param isAllowed Allowance status for duration;
     */
    function setLockDuration(address lp, uint64 duration, bool isAllowed) external onlyOwner {
        lockDuration[lp][duration] = isAllowed;
        emit LockDurationSet(lp, duration, isAllowed);
    }

    /**
     * @dev Sets the array of time for which lp can be blocked.
     * 
     * @param lp The addres of lp token;
     * @param durations Array of time for which it will be possible to lock;
     * @param isAllowed Allowance status for durations;
     */
    function setLockDurations(address lp, uint64[] calldata durations, bool isAllowed) external onlyOwner {
        for (uint256 i; i < durations.length; i++) {
            lockDuration[lp][durations[i]] = isAllowed;
            emit LockDurationSet(lp, durations[i], isAllowed);
        }
    }

    /**
     * @dev Get locks count for user.
     * 
     * @param user The address of user to get locks;
     */
    function getLocksCount(address user) external view returns (uint256) {
        return locks[user].length;
    }

    /**
     * @dev Find lock by id.
     * 
     * @param lockId_ The id of lock to find;
     */
    function _findLock(uint256 lockId_) private view  returns(Lock memory, uint256) {
        for (uint256 i; i < locks[msg.sender].length; ++i) {
            if (locks[msg.sender][i].id == lockId_) {
                return (locks[msg.sender][i], i);
            }
        }
        revert("Locker: non-existent lock");
    }

    /**
     * @dev Delete lock by index.
     * 
     * @param index The index of lock to delete;
     */
    function _deleteLock(uint256 index) private {
        uint256 length_ = locks[msg.sender].length; 
        if (index == length_ - 1) {
            locks[msg.sender].pop();
        } else {
            locks[msg.sender][index] = locks[msg.sender][length_ - 1];
            locks[msg.sender].pop();
        }
    }
}