// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "base64-sol/base64.sol";

contract PhantaSpace is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable, ERC721Burnable {
    uint public precision;
    constructor(uint _precision) ERC721("PhantaSpace", unicode"🌐") {
        precision = _precision;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(address to, uint256 tokenId, string memory uri)
        public
        onlyOwner
    {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    
// function to verify and mint with geocode as tokenID

    function mint(uint256 geocode)
        public
        returns (uint p, uint longitude, uint latitude, uint levelSign, uint level)
    {
        // verify the geocode is acceptable
        p = geocode % 10;
        require(p <= precision, "Precision not yet available");

        longitude = geocode / 10**(p+1) % 1000;
        require(longitude <= 360, "Longitude show be less than 360");

        latitude = geocode / 10**(2*p+4) % 1000;
        require(latitude <= 180, "Latitude show be less than 180");

        levelSign = geocode / 10**(2*p+7) % 10;
        require(levelSign == 1 || levelSign == 3, "Level sign should be 1 or 3");

        level = geocode / 10**(2*p+8);
        if(levelSign == 1) {
            require(level <= 10**p, "Level should be less than 10**precision if it's negative");
        }

        _safeMint(owner(), geocode);

        _setTokenURI(geocode, formatTokenURI(geocode));
        
    }

    function formatTokenURI(uint256 geocode) public pure returns (string memory) {
            return string(
                    abi.encodePacked(
                        "data:application/json;base64,",
                        Base64.encode(
                            bytes(
                                abi.encodePacked(
                                    '{"name": "PhantaSpace",', 
                                    '"description":"A space in PhantaSpace!",',
                                    ' "attributes":"",',
                                    ' "image":"https://phanta.space/#/NFT/space/', Strings.toString(geocode),'",',
                                    ' "animation_url":"https://phanta.space/#/NFT/space/', Strings.toString(geocode),'",',
                                    ' "external_url":"https://phanta.space/#/space/', Strings.toString(geocode),'"',
                                    '}'
                                )
                            )
                        )
                    )
                );
        }

    function contractURI() public view returns (string memory) {
        return string(
                    abi.encodePacked(
                        "data:application/json;base64,",
                        Base64.encode(
                            bytes(
                                abi.encodePacked(
                                    '{',
                                    '"name": "PhantaSpace",',
                                    '"description": "Your own space in PhantaSpace",',
                                    '"image": "https://phanta.space/favicon.ico",',
                                    '"external_link": "https://phanta.space",',
                                    '"seller_fee_basis_points": 10000,',
                                    '"fee_recipient": "', address2String(owner()), '"',
                                    '}'
                                )
                            )
                        )
                    )
                );
    }

    function address2String(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);            
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

}

    