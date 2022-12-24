# Biconomy Take Home Assignment using Biconomy SDK

This project demonstrates a basic basic usage of Biconomy SDK for enabling the meta transactions/gasless transactions.
The project used the openzeppeling ERC2771Context smart contract to make the Wallet contract meta transaction enabled.
Used the trusted forwarder approach and used the Biconomy trusted forwarded address for gasless transactions.



There are 4 Smart contracts:
TLSCWallet.sol - This is the main contract which acts as a smart contract wallet - Accepts the deposits and withdrawals enabled.
                 The Deposits has a vesting time period. The default was set to 60 seconds and a public function provided which 
                 can be used to change the vesting period by the admin in the future. This wallet accepts both ERC20 tokens and Ether.
Matic.sol  -     This is an ERC20 token to mint 5000 matic tokens to be used to deposit into wallet.
Shib.sol   -     This is an ERC20 token to mint 5000 ShibaInu to be used for dpositing
Usdt.sol   -     This is an ERc20 token to mint 5000 USDT tokens.

Smart Contracts are depolyed to Goerli network:
TLSWCdeployed to: 0x4d0535753c84AE8817ddF26082D4a38A02aa5f78 by 0x280a788d59c49129F9c3B1AB6EA28B5a8C34d93F
Matic deployed to: 0xD0D69D65788D5303c5477756Cfe07A5dBd499897 by 0xE1c9138D9eD172d0001338641599c6D84882B4b5
Shib deployed to: 0xD654289bb5cf5C234BB6C5d04603886a971798a4 by 0xE1c9138D9eD172d0001338641599c6D84882B4b5
Tether deployed to: 0x6cBe5f06a5321255c303179E20bb9c5225d0D948 by 0xE1c9138D9eD172d0001338641599c6D84882B4b5



Client is implemented using the ReactJs

A 2 minute video showing the testing of the feature




https://user-images.githubusercontent.com/38311122/209430218-b9c89a3d-521f-4020-8204-ab122998a5ba.mp4


