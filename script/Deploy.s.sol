// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "forge-std/Script.sol";
import "../src/AgentTab.sol";
import "../src/MockStable.sol";
import "../src/MockUSAT.sol";
contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        AgentTab t = new AgentTab();
        MockStable m = new MockStable();
        console.log("AgentTab", address(t)); console.log("MockStable", address(m));
        console.log("MockUSAT", address(new MockUSAT()));
        vm.stopBroadcast();
    }
}
