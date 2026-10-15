// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
/// Testnet/local-only USA₮ stand-in with EIP-3009 transferWithAuthorization (the x402 `exact` path).
/// EIP-712 domain mirrors mainnet USA₮: name "Tether America USD", version "1". 6 decimals. Anyone can mint.
contract MockUSAT {
    string public constant name = "Tether America USD"; string public constant symbol = "USAT";
    string public constant version = "1"; uint8 public constant decimals = 6;
    bytes32 public constant TRANSFER_WITH_AUTHORIZATION_TYPEHASH = keccak256(
        "TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)");
    bytes32 public immutable DOMAIN_SEPARATOR;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => mapping(bytes32 => bool)) public authorizationState;
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce);

    constructor() {
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes(name)), keccak256(bytes(version)), block.chainid, address(this)));
    }
    function mint(address to, uint256 v) external { totalSupply += v; balanceOf[to] += v; emit Transfer(address(0), to, v); }
    function approve(address s, uint256 v) external returns (bool) { allowance[msg.sender][s] = v; emit Approval(msg.sender, s, v); return true; }
    function transfer(address to, uint256 v) external returns (bool) { _move(msg.sender, to, v); return true; }
    function transferFrom(address f, address to, uint256 v) external returns (bool) {
        uint256 a = allowance[f][msg.sender];
        if (a != type(uint256).max) allowance[f][msg.sender] = a - v;
        _move(f, to, v); return true;
    }
    function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s) public {
        require(block.timestamp > validAfter && block.timestamp < validBefore, "auth time");
        require(!authorizationState[from][nonce], "auth used");
        bytes32 h = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, keccak256(abi.encode(
            TRANSFER_WITH_AUTHORIZATION_TYPEHASH, from, to, value, validAfter, validBefore, nonce))));
        require(uint256(s) <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0, "bad s");
        address signer = ecrecover(h, v, r, s);
        require(signer != address(0) && signer == from, "bad sig");
        authorizationState[from][nonce] = true;
        emit AuthorizationUsed(from, nonce);
        _move(from, to, value);
    }
    function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, bytes calldata sig) external {
        require(sig.length == 65, "sig len");
        transferWithAuthorization(from, to, value, validAfter, validBefore, nonce, uint8(sig[64]), bytes32(sig[0:32]), bytes32(sig[32:64]));
    }
    function _move(address f, address to, uint256 v) private { balanceOf[f] -= v; balanceOf[to] += v; emit Transfer(f, to, v); }
}
