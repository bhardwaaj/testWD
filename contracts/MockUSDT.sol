// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal ERC20-like token used as Mock USDT on testnets.
contract MockUSDT {
    string public name = "Mock USDT";
    string public symbol = "USDT";
    uint8 public decimals = 6;

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function mint(address to, uint256 amount) external {
        require(to != address(0), "Zero address");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "Not allowed");

        allowance[from][msg.sender] = allowed - amount;
        _transfer(from, to, amount);

        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "Zero address");
        uint256 balance = balanceOf[from];
        require(balance >= amount, "Insufficient balance");

        balanceOf[from] = balance - amount;
        balanceOf[to] += amount;

        emit Transfer(from, to, amount);
    }
}