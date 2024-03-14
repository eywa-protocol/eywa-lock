# Locker for LP tokens
## Description
This Locker contract provides functionality for locking LP (Liquidity Provider) tokens for a specified duration, allowing users to lock and unlock LP tokens, with permissions set for lock durations and tokens


## Using the Locker Contract
To lock LP tokens, a user needs to call the lock function, providing the LP token address, the amount to lock, and the duration of the lock in seconds. You can choose durations, which permitted by owner of Locker.
`locker.lock(LPaddress, amount, duration)`

To unlock tokens, the user must call the unlock function, passing the ID of the lock. Lock id you may get by geting array of locks by `locks = locks(userAddress)`, after it choose index of lock `lock = locks[0]` and call `lockID = lock.id`
`locker.unlock(lockID)`


## Quick start
npm install

## run tests
npx hardhat test
