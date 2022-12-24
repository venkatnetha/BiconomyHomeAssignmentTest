//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title An ERC20 contract named Matic
/// @author Venkatesh K
/// @notice Serves as a fungible token
/// @dev Inherits the OpenZepplin ERC20 implentation
contract Matic is ERC20 {
  // @notice Deploys the smart contract and creates 5000 tokens
  /// @dev Assigns `msg.sender` to the owner state variable
  constructor() ERC20('MATIC', 'Polygon') {
    _mint(msg.sender, 5000 * 10**18);
  }
}