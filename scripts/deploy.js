async function main() {
  [signer1, signer2] = await ethers.getSigners();

  const forwarder = "0xE041608922d06a4F26C0d4c27d8bCD01daf1f792";

  const TLSWallet = await ethers.getContractFactory("TLSCWallet", signer1);
  const tlswallet = await TLSWallet.deploy(forwarder);

  console.log("TimeLock Smart wallet contract deployed")

  const Matic = await ethers.getContractFactory("Matic", signer2);
  const matic = await Matic.deploy();
  const Shib = await ethers.getContractFactory("Shib", signer2);
  const shib = await Shib.deploy();
  const Usdt = await ethers.getContractFactory("Usdt", signer2);
  const usdt = await Usdt.deploy();

  console.log("tokens deployed",matic.address);

  await tlswallet.whiteListToken(
    ethers.utils.formatBytes32String('Matic'),
    matic.address
  );

  
  await tlswallet.whiteListToken(
    ethers.utils.formatBytes32String('Shib'),
    shib.address
  );
  await tlswallet.whiteListToken(
    ethers.utils.formatBytes32String('Usdt'),
    usdt.address
  );
  await tlswallet.whiteListToken(
    ethers.utils.formatBytes32String('Eth'),
    '0x09B5DC75789389d1627879bA194874F459364859'
  );

  console.log("TLSWCdeployed to:", tlswallet.address, "by", signer1.address);
  console.log("Matic deployed to:", matic.address, "by", signer2.address);
  console.log("Shib deployed to:", shib.address, "by", signer2.address);
  console.log("Tether deployed to:", usdt.address, "by", signer2.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });