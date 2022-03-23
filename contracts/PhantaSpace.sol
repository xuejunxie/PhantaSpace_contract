// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


//   _____  _                 _         _____                      
//  |  __ \| |               | |       / ____|                     
//  | |__) | |__   __ _ _ __ | |_ __ _| (___  _ __   __ _  ___ ___ 
//  |  ___/| '_ \ / _` | '_ \| __/ _` |\___ \| '_ \ / _` |/ __/ _ \
//  | |    | | | | (_| | | | | || (_| |____) | |_) | (_| | (_|  __/
//  |_|    |_| |_|\__,_|_| |_|\__\__,_|_____/| .__/ \__,_|\___\___|
//                                           | |                   
//                                           |_|                   


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "base64-sol/base64.sol";

import "hardhat/console.sol";


contract PhantaSpace is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable, ERC721Burnable {
    uint public precisionLimit;
    string public baseURL;
    string public externalURL;
    uint public vendingPrice;
    mapping (uint256 => bool) public inAuction;
    mapping (uint256 => uint) public highestBid;

    constructor(uint _precision, string memory _baseURL, string memory _externalURL, uint _vendingPrice) ERC721("PhantaSpace", unicode"🌐") {
        precisionLimit = _precision;
        baseURL = _baseURL;
        externalURL = _externalURL;
        vendingPrice = _vendingPrice;
    }

    function setBaseURL (string memory _baseURL) public {
        baseURL = _baseURL;
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
        return formatTokenURI(tokenId);



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
    {
        // verify the geocode is acceptable
        uint p = geocode % 10;
        require(p <= precisionLimit, "Precision not yet available");

        uint longitude = geocode / 10**(p+1) % 1000;
        require(longitude <= 360, "Longitude show be less than 360");

        uint latitude = geocode / 10**(2*p+4) % 1000;
        require(latitude <= 180, "Latitude show be less than 180");

        uint levelSign = geocode / 10**(2*p+7) % 10;
        require(levelSign == 1 || levelSign == 3, "Level sign should be 1 or 3");

        uint level = geocode / 10**(2*p+8);
        if(levelSign == 1) {
            require(level <= 10**p, "Level should be less than 10**precision if it's negative");
        }

        _safeMint(owner(), geocode);

        
    }


    function formatTokenURI(uint256 geocode) public view returns (string memory) {
            return string(
                    abi.encodePacked(
                        "data:application/json;base64,",
                        Base64.encode(
                            bytes(
                                abi.encodePacked(
                                    '{"name": "PhantaSpace",', 
                                    '"description":"A space in PhantaSpace!",',
                                    ' "attributes":"",',
                                    ' "image":"', baseURL, Strings.toString(geocode),'",',
                                    ' "animation_url":"', baseURL, Strings.toString(geocode),'",',
                                    ' "external_url":"', externalURL, Strings.toString(geocode),'"',
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
                                    '"image": "https://phanta.space/favicon.svg",',
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

    // function to split the space into subspaces
    function mintSubspace(uint256 geocode, uint x, uint y, uint z) public {
        require(_exists(geocode), "Space is not minted yet");
        require(msg.sender == ownerOf(geocode), "Only space owner can mint subspace");
        require(x>=0 && x<=9, "x should be between 0 and 9");
        require(y>=0 && y<=9, "y should be between 0 and 9");
        require(z>=0 && z<=9, "z should be between 0 and 9");
        uint p = geocode % 10;
        uint longitude = (geocode / 10**(1) % 10**(p + 3) * 10 + x) * 10;
        uint latitude = (geocode / 10**(p + 4) % 10**(p + 3) * 10 + y) * 10**(p + 5);
        uint levelSign = (geocode / 10**(2*p + 7) % 10) * 10**(2*(p+1) + 7);
        uint level = (geocode / 10**(2*p+8) * 10 + z) * 10**(2*(p+1) + 8);
        uint newGeocode = level + levelSign + latitude + longitude + p + 1;
        _safeMint(ownerOf(geocode), newGeocode);
    }

    // random function
    function randomMint(uint level, uint levelSign, uint n) internal  {
        for (uint i = 0; i < n; i++) {
            uint256 random = uint(keccak256(abi.encodePacked(block.number, block.timestamp, block.difficulty, msg.sender, level, i)));
            uint longitude = random % 3600;
            uint latitude = random / 3600 % 1800;
            uint geocode = level * 10**10 + levelSign * 10**9 + latitude * 10**5 + longitude * 10**1 + 1;
            console.log(geocode);
            if (_exists(geocode) || inAuction[geocode]) {
                n = n + 1;
            } else {
                _safeMint(msg.sender, geocode);
            }
        }
    }

    // vending function
    function vending() public payable {
        require(msg.value > 0, "Value should be greater than 0");
        uint n = msg.value / vendingPrice;
        randomMint(0, 3, n);
    }


}
contract EnglishAuction {
    event Start();
    event Bid(address indexed sender, uint amount);
    event Withdraw(address indexed bidder, uint amount);
    event End(address winner, uint amount);

    IERC721 public nft;
    uint public nftId;

    address payable public seller;
    uint public endAt;
    bool public started;
    bool public ended;

    address public highestBidder;
    uint public highestBid;
    mapping(address => uint) public bids;

    constructor(
        address _nft,
        uint _nftId,
        uint _startingBid
    ) {
        nft = IERC721(_nft);
        nftId = _nftId;

        seller = payable(msg.sender);
        highestBid = _startingBid;
    }

    function start() external {
        require(!started, "started");
        require(msg.sender == seller, "not seller");

        nft.transferFrom(msg.sender, address(this), nftId);
        started = true;
        endAt = block.timestamp + 7 days;

        emit Start();
    }

    function bid() external payable {
        require(started, "not started");
        require(block.timestamp < endAt, "ended");
        require(msg.value > highestBid, "value < highest");

        if (highestBidder != address(0)) {
            bids[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;

        emit Bid(msg.sender, msg.value);
    }

    function withdraw() external {
        uint bal = bids[msg.sender];
        bids[msg.sender] = 0;
        payable(msg.sender).transfer(bal);

        emit Withdraw(msg.sender, bal);
    }

    function end() external {
        require(started, "not started");
        require(block.timestamp >= endAt, "not ended");
        require(!ended, "ended");

        ended = true;
        if (highestBidder != address(0)) {
            nft.safeTransferFrom(address(this), highestBidder, nftId);
            seller.transfer(highestBid);
        } else {
            nft.safeTransferFrom(address(this), seller, nftId);
        }

        emit End(highestBidder, highestBid);
    }
}