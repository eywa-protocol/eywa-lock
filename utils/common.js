const parse18 = ethers.parseEther;
const parse6 = (ether) => ethers.utils.parseUnits(ether, 6);


module.exports = {
    parse18,
    parse6
};