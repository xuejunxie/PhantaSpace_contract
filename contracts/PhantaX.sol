// SPXX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";


/**
* @title PhantaX
* @notice This is the NFT exchange contract for PhantaSpace Marketplace

XXXXXXXXX  XXX                        XXX             XXXX   XXXX 
XXX   XXXX XXX                        XXX              XXXX XXXX  
XXX    XXX XXX                        XXX               XXXXXXX   
XXX   XXXX XXXXXXX   XXXXXX  XXXXXXX  XXXXXX  XXXXXX     XXXXX    
XXXXXXXX"  XXX XXXX     XXXX XXX XXXX XXX        XXXX    XXXXX    
XXX        XXX  XXX XXXXXXXX XXX  XXX XXX    XXXXXXXX   XXXXXXX   
XXX        XXX  XXX XXX  XXX XXX  XXX XXXX   XXX  XXX  XXXX XXXX  
XXX        XXX  XXX XXXXXXXX XXX  XXX   XXXX xXXXXXXx XXXX   XXXX 
 */

contract PhantaX is Initializable, OwnableUpgradeable, PausableUpgradeable,   UUPSUpgradeable, ReentrancyGuardUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor

    function initialize() initializer public {
        __Ownable_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        
    }


    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }


    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

}