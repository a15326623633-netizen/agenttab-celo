// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "forge-std/Test.sol";
import "../src/MockUSAT.sol";
contract MockUSATTest is Test {
    MockUSAT t; uint256 pk = 0xA11CE; address from;
    function setUp() public { t = new MockUSAT(); from = vm.addr(pk); t.mint(from, 1e6); vm.warp(1000); }
    function _sig(address to, uint256 v, bytes32 n) internal view returns (uint8, bytes32, bytes32) {
        bytes32 h = keccak256(abi.encodePacked("\x19\x01", t.DOMAIN_SEPARATOR(), keccak256(abi.encode(
            t.TRANSFER_WITH_AUTHORIZATION_TYPEHASH(), from, to, v, 0, 2000, n))));
        return vm.sign(pk, h);
    }
    function testAuthTransferAndReplay() public {
        (uint8 v, bytes32 r, bytes32 s) = _sig(address(2), 1e4, bytes32("n1"));
        t.transferWithAuthorization(from, address(2), 1e4, 0, 2000, bytes32("n1"), abi.encodePacked(r, s, v));
        assertEq(t.balanceOf(address(2)), 1e4);
        vm.expectRevert(bytes("auth used"));
        t.transferWithAuthorization(from, address(2), 1e4, 0, 2000, bytes32("n1"), v, r, s);
    }
}
