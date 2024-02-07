const { ethers } = require('hardhat');
const { expect } = require('chai');
const { parse6, parse18, signInvoice, getReceipt } = require('../utils/common');
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe('Locker unit tests', () => {

  let factory, balanceBefore, balanceAfter, lock
  const amount = parse18('100');
  const durations = [604800, 1209600, 2419200];  // 1 week, 2 weeks, 4 weeks in secs
  const customTimestamp = 1800000000;


  before(async () => {
    [owner, alice, mallory] = await ethers.getSigners();

    factory = await ethers.getContractFactory('Locker');
    locker = await factory.deploy();
    await locker.waitForDeployment();

    factory = await ethers.getContractFactory('TestTokenPermit');
    token1 = await factory.deploy("Token1", "Token1", 18);
    await token1.waitForDeployment();

    factory = await ethers.getContractFactory('TestTokenPermit');
    token2 = await factory.deploy("Token2", "Token2", 18);
    await token2.waitForDeployment();
  });

  beforeEach(async () => {
   await token1.mint(alice.address, amount);
  });

  it("should set LP allowance", async function () {
    await locker.setLpAllowance(token1, true);
    expect(await locker.isLpAllowed(token1)).to.be.equal(true);
  });

  it("shouldn\'t set LP allowance if not an owner", async function () {
    await expect(locker.connect(alice).setLpAllowance(token1, true)).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should set lock duration", async function () {
    for (let duration of durations) {
      await locker.setLockDuration(token1, duration, true);
      expect(await locker.lockDuration(token1, duration)).to.be.equal(true);
    }
  });

  it("shouldn\'t set lock duration of not an owner", async function () {
    await expect(locker.connect(alice).setLockDuration(token1, 42, true)).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should lock", async function () {
    balanceBefore = await token1.balanceOf(alice.address);
    await token1.connect(alice).approve(locker, amount);
    await locker.connect(alice).lock(token1, amount, durations[0]);
    balanceAfter = await token1.balanceOf(alice.address);

    lock = await locker.locks(alice.address, 0);
    expect(balanceBefore - balanceAfter).to.be.equals(amount);
    expect(await token1.balanceOf(locker)).to.be.equal(amount);
    expect(await locker.getLocksCount(alice.address)).to.be.equal(1);
    expect(lock.lp).to.be.equal(token1)
    expect(lock.amount).to.be.equal(amount)
    expect(lock.duration).to.be.equal(durations[0])
  });


  it("shouldn\'t lock if wrong LP", async function () {
    await expect(locker.connect(alice).lock(token2, amount, durations[0])).to.be.revertedWith("Locker: LP not allowed");
  });

  it("shouldn\'t lock if wrong LP", async function () {
    await expect(locker.connect(alice).lock(token1, amount, 42)).to.be.revertedWith("Locker: wrong duration");
  });

  it("shouldn't unlock if lock is going", async function () {
    lockId = 1
    await expect(locker.connect(alice).unlock(lockId)).to.be.revertedWith("Locker: still locked");
  });

  it("shouldn't unlock if non-existing lock", async function () {
    lockId = 42
    await expect(locker.connect(alice).unlock(lockId)).to.be.revertedWith("Locker: non-existent lock");
  });

  it("should unlock", async function () {
    lockId = 1
    balanceBefore = await token1.balanceOf(alice.address);
    await network.provider.send("evm_increaseTime", [604800]);
    await network.provider.send("evm_mine");
    await locker.connect(alice).unlock(lockId);
    balanceAfter = await token1.balanceOf(alice.address);

    expect(balanceAfter - balanceBefore).to.be.equal(amount);
    expect(await token1.balanceOf(locker)).to.be.equal(0);
    expect(await locker.getLocksCount(alice.address)).to.be.equal(0);
  });

  it("should lock and unlock many", async function () {
    balanceBefore = await token1.balanceOf(alice.address);
    await token1.connect(alice).approve(locker, ethers.MaxUint256);
    await locker.connect(alice).lock(token1, parse18('10'), durations[0]); // lockId 2
    await locker.connect(alice).lock(token1, parse18('20'), durations[1]); // lockId 3
    await locker.connect(alice).lock(token1, parse18('30'), durations[2]); // lockId 4
    balanceAfter = await token1.balanceOf(alice.address);

    expect(balanceBefore - balanceAfter).to.be.equals(parse18('60'));
    expect(await locker.getLocksCount(alice.address)).to.be.equal(3);

    await network.provider.send("evm_increaseTime", [2419200]);
    await network.provider.send("evm_mine");

    balanceBefore = await token1.balanceOf(alice.address);
    await locker.connect(alice).unlock(3);
    balanceAfter = await token1.balanceOf(alice.address);
    expect(balanceAfter - balanceBefore).to.be.equals(parse18('20'));
    expect(await locker.getLocksCount(alice.address)).to.be.equal(2);

    balanceBefore = await token1.balanceOf(alice.address);
    await locker.connect(alice).unlock(4);
    balanceAfter = await token1.balanceOf(alice.address);
    expect(balanceAfter - balanceBefore).to.be.equals(parse18('30'));
    expect(await locker.getLocksCount(alice.address)).to.be.equal(1);

    balanceBefore = await token1.balanceOf(alice.address);
    await locker.connect(alice).unlock(2);
    balanceAfter = await token1.balanceOf(alice.address);
    expect(balanceAfter - balanceBefore).to.be.equals(parse18('10'));
    expect(await locker.getLocksCount(alice.address)).to.be.equal(0);
  });

});
