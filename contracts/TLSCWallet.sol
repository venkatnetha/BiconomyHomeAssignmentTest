//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title An Time Locked Smart Wallet with Meta transactions enabled smart contract
/// @author Venkatesh kanchanpally
/// @notice Serves as a wallet and gasless transactions for chosen methods
/// @dev Inherits the OpenZepplin ERC2771 and ReentrancyGuard implentation
contract TLSCWallet is ERC2771Context, ReentrancyGuard {

    using SafeERC20 for IERC20;
    event EtherDeposited(address indexed _user);
    event TokenDeposited(bytes32 indexed _symbol, uint256 indexed _amount);
    event EtherClaimed(uint256 indexed amount);
    event TokenClaimed(bytes32 indexed symbol, uint256 indexed _amount);
    event TokenWhitelisted(bytes32 indexed _symbol);

    /// @notice Deployer of the smart contract
    /// @dev Only the owner can call the mint and burn functions
    /// @return owner the address of this smart contract's deployer
    address public admin;
    mapping(address => uint256) public lockedTimeOfUser;
    uint256 public lockedPeriod;
    mapping(address => mapping(bytes32 => uint256)) public balances;
    bytes32[] public whiteListedTokenSymbols;
    mapping(bytes32 => address) public whiteListedTokens;
 
    modifier onlyOwner(){
        require(_msgSender() == admin, "Only admin can call this function");
        _;
    }

    /// @notice Deploys the smart contract with the TrustedForwarder address from Biconomy for gasless txns
    /// @dev Assigns `_msgSender()` to the owner state variable
    constructor(address trustedForwarder) ERC2771Context(trustedForwarder){
        admin = _msgSender();
        lockedPeriod = 60 seconds;
    }

    /// @notice deposits the user ERC20 tokens into this contract wallet and time locks the amount and user
    /// @dev Function can only be called user/anyone who wish to deposit their funds
    /// @param _symbol The symbol of the ERC20 token which is getting deposited into wallet
    /// @param _amount The amount of tokens to be deposited in to wallet
    function depositTokens(bytes32 _symbol, uint256 _amount) external {
        require(_symbol[0] != 0 , "Invalid symbol of Token passed");
        require(_amount > 0, "Zero amount tokens passed");
        balances[_msgSender()][_symbol] += _amount;
        IERC20(whiteListedTokens[_symbol]).transferFrom(_msgSender(), address(this), _amount);
        lockedTimeOfUser[_msgSender()] = block.timestamp;
        emit TokenDeposited(_symbol,_amount);
    }

    /// @notice deposits the user sent Ether into this contract wallet and time locks the amount and user
    /// @dev Function can only be called user/anyone who wish to deposit their fund
    function depositEth() public payable {
        require(msg.value > 0 , "Zero Eth Sent for Deposit");
        balances[_msgSender()]['Eth'] += msg.value / 10 ** 18;
        lockedTimeOfUser[_msgSender()] = block.timestamp;
        emit EtherDeposited(_msgSender());
    }

    /// @notice After the vesting time is elapsed, user is allowed to claim their funds.
    /// @dev Function can only be called user/anyone who wish to claim their fund
    /// @param _amount The amount of tokens to be claimed from the wallet
    function claimEther(uint256 _amount) external payable nonReentrant{
        require(block.timestamp > lockedTimeOfUser[_msgSender()] + lockedPeriod, "Can not claim as the vesting time did not elapse");
        require(_amount > 0, "Claim amount should be greater than zero");
        require(balances[_msgSender()]['Eth'] >= _amount, 'Insufficient Ether balance');
        balances[_msgSender()]['Eth'] -= _amount;
        payable(_msgSender()).call{value: _amount}("");
        emit EtherClaimed(_amount);
    }

    /// @notice claims the tokens deposited in the wallet after the vesting time has been elapsed
    /// @dev Function can only be called user/anyone who wish to claim their funds
    /// @param _symbol The symbol of the ERC20 token which is getting claimed from the wallet
    /// @param _amount The amount of tokens to be claimed from the wallet
    function claimTokens(bytes32 _symbol, uint256 _amount) external nonReentrant{
        require(block.timestamp > lockedTimeOfUser[_msgSender()] + lockedPeriod, "Can not claim as the vesting time did not elapse");
        require(_symbol[0] != 0 , "Invalid symbol of Token passed");
        require(_amount > 0, "Claim amount should be greater than zero");
        require(balances[_msgSender()][_symbol] >= _amount, 'Insufficient funds');
        balances[_msgSender()][_symbol] -= _amount;
        IERC20(whiteListedTokens[_symbol]).transfer(_msgSender(), _amount);
        emit TokenClaimed(_symbol,_amount);
    }

    receive()  external payable {
        balances[_msgSender()]['Eth'] += msg.value;
    }

    /// @notice The tokens and Ether deposited into this wallet is time locked or has a certain vesting period. 
    /// @dev Function can only be called by onwer to change the vesting time period
    /// @param _unlockTime The amount of seconds the funds are locked into smart wallet
    function setTimeLockPeriod(uint256 _unlockTime) public onlyOwner {
        require(_unlockTime > 0, "Zero lock-in period provided");
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );
        lockedPeriod = _unlockTime;
    }

    /// @notice The tokens which are allowed to deposited into the wallet needs to be whitelisted before accepting any deposits
    /// @dev Function can only be called owner to whitelist the token
    /// @param _symbol The symbol of the ERC20 token which is whitelisted
    /// @param _tokenAddress The token address of the whitelisted token
    function whiteListToken(bytes32 _symbol, address _tokenAddress) external onlyOwner {
        require(_symbol.length > 0, "Empty token symbol not allowed");
        require(_tokenAddress != address(0), "Zero token address passed");
        whiteListedTokenSymbols.push(_symbol);
        whiteListedTokens[_symbol] = _tokenAddress;
        emit TokenWhitelisted(_symbol);
    }
    
    /// @notice To return the white listed token symbols from the smart wallet
    /// @dev Function can only be called by anyone to know the list of tokens being accepted by walllet
    function getWhiteListenTokenSymbols() external view returns(bytes32[] memory) {
        return whiteListedTokenSymbols;
    }

    /// @notice To return the white listed token balance from the smart wallet
    /// @dev Function can only be called by anyone to know the token balance
    /// @param _symbol The symbol of the ERC20 token whose balance is queried
    function getTokenBalance(bytes32 _symbol) external view returns (uint256) {
        return balances[_msgSender()][_symbol];
    }

    /// @notice To return the white listed token address from the smart wallet
    /// @dev Function can only be called by anyone to know the token address
    /// @param _symbol The symbol of the ERC20 token address
    function getWhiteListedTokenAddress(bytes32 _symbol) external view returns(address) {
        return whiteListedTokens[_symbol];
    }

    /**
   * Overrides
   */
    /// @notice override the _msgSender() method from the ERC2771Context contract
    /// @dev override method
    function _msgSender() internal view virtual override(ERC2771Context) returns (address sender) {
        return ERC2771Context._msgSender();
    }

    /// @notice override the _msgData() method from the ERC2771Context contract
    /// @dev override method
    function _msgData() internal view virtual override(ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

}