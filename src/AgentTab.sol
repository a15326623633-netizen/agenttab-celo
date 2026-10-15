// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 v) external returns (bool);
    function transferFrom(address f, address t, uint256 v) external returns (bool);
}

/// @title AgentTab - unidirectional stablecoin payment tabs for AI agents.
/// @notice Payer (an agent) escrows a stablecoin (USDT/USAT/wBRL/cUSD...) for a provider.
///         Per API call the payer signs an EIP-712 voucher with the new cumulative amount;
///         the provider settles any time (batching many calls into one tx) and the payer
///         can reclaim the unspent balance after expiry. Chain-agnostic (Celo / Base).
contract AgentTab {
    struct Tab { address payer; address provider; address token; uint128 deposit; uint128 claimed; uint64 expiry; }

    bytes32 public constant VOUCHER_TYPEHASH = keccak256("Voucher(uint256 tabId,uint256 cumulative)");
    bytes32 public immutable DOMAIN_SEPARATOR;
    uint256 public nextId = 1;
    mapping(uint256 => Tab) public tabs;

    event Opened(uint256 indexed id, address indexed payer, address indexed provider, address token, uint256 amount, uint64 expiry);
    event ToppedUp(uint256 indexed id, uint256 amount);
    event Settled(uint256 indexed id, uint256 paid, uint256 cumulative);
    event Refunded(uint256 indexed id, uint256 amount);

    error BadSig(); error NotProvider(); error NotPayer(); error Exceeds(); error NotExpired(); error Stale(); error TransferFailed();

    constructor() {
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256("AgentTab"), keccak256("1"), block.chainid, address(this)));
    }

    function open(address provider, address token, uint128 amount, uint64 expiry) external returns (uint256 id) {
        id = nextId++;
        tabs[id] = Tab(msg.sender, provider, token, amount, 0, expiry);
        _pull(token, amount);
        emit Opened(id, msg.sender, provider, token, amount, expiry);
    }

    function topUp(uint256 id, uint128 amount, uint64 newExpiry) external {
        Tab storage t = tabs[id];
        if (msg.sender != t.payer) revert NotPayer();
        t.deposit += amount;
        if (newExpiry > t.expiry) t.expiry = newExpiry;
        _pull(t.token, amount);
        emit ToppedUp(id, amount);
    }

    function digest(uint256 id, uint256 cumulative) public view returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, keccak256(abi.encode(VOUCHER_TYPEHASH, id, cumulative))));
    }

    function settle(uint256 id, uint128 cumulative, bytes calldata sig) external {
        Tab storage t = tabs[id];
        if (msg.sender != t.provider) revert NotProvider();
        if (cumulative > t.deposit) revert Exceeds();
        if (cumulative <= t.claimed) revert Stale();
        if (_recover(digest(id, cumulative), sig) != t.payer) revert BadSig();
        uint256 pay = cumulative - t.claimed;
        t.claimed = cumulative;
        if (!IERC20(t.token).transfer(t.provider, pay)) revert TransferFailed();
        emit Settled(id, pay, cumulative);
    }

    function refund(uint256 id) external {
        Tab storage t = tabs[id];
        if (msg.sender != t.payer) revert NotPayer();
        if (block.timestamp < t.expiry) revert NotExpired();
        uint256 left = t.deposit - t.claimed;
        t.deposit = t.claimed;
        if (!IERC20(t.token).transfer(t.payer, left)) revert TransferFailed();
        emit Refunded(id, left);
    }

    function _pull(address token, uint256 amount) private {
        if (!IERC20(token).transferFrom(msg.sender, address(this), amount)) revert TransferFailed();
    }

    function _recover(bytes32 h, bytes calldata sig) private pure returns (address a) {
        if (sig.length != 65) revert BadSig();
        bytes32 r; bytes32 s; uint8 v;
        assembly { r := calldataload(sig.offset) s := calldataload(add(sig.offset, 32)) v := byte(0, calldataload(add(sig.offset, 64))) }
        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) revert BadSig();
        a = ecrecover(h, v, r, s);
        if (a == address(0)) revert BadSig();
    }
}
