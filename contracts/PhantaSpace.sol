// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;


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
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "base64-sol/base64.sol";



contract PhantaSpace is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable, ERC721Burnable, ERC721Royalty {
    uint public precisionLimit;
    string public imageURL;
    string public animationURL;
    string public externalURL;
    uint public vendingPrice;
    uint public auctionDuration;
    uint public royaltyFeesInBips;

    mapping (uint256 => uint) public auctionStartTime;
    mapping (uint256 => mapping (address => uint)) public pendingReturns;
    mapping (uint256 => uint) public highestBid;
    mapping (uint256 => address) public highestBidder;
    mapping (uint256 => bool) public availableForAuction;

    event AuctionStarted(uint256 geocode, uint256 startTime);
    event AuctionEnded(uint256 geocode, address highestBidder, uint256 highestBid);
    event HighestBidIncreased(uint256 geocode,address bidder, uint256 bid);
    event VendingHappend(uint256[] geocodes);
    event SubSpaceMinted(uint256 geocode);
    event SubSpaceAuctionAllowed(uint256 geocode);
    event SubSpaceAuctionStarted(uint256 geocode, uint256 startTime);


    constructor(uint _precision, string memory _imageURL, string memory _animationURL, string memory _externalURL, uint _vendingPrice, uint _auctionDuration, uint96 _royaltyFeesInBips) ERC721("PhantaSpace", unicode"🌐") {
        precisionLimit = _precision;
        imageURL = _imageURL;
        animationURL = _animationURL;
        externalURL = _externalURL;
        vendingPrice = _vendingPrice;
        auctionDuration = _auctionDuration;
        royaltyFeesInBips = _royaltyFeesInBips;
        _setDefaultRoyalty(owner(), _royaltyFeesInBips);

    }

    function setAuctionduration(uint _auctionDuration) public onlyOwner{
        auctionDuration = _auctionDuration;
    }

    function setImageURL(string memory _imageURL) public onlyOwner {
        imageURL = _imageURL;
    }

    function setAnimationURL (string memory _animationURL) public onlyOwner {
        animationURL = _animationURL;
    }

    function setPrecisionLimit (uint _precision) public onlyOwner{
        precisionLimit = _precision;
    }

    function setExternalURL (string memory _externalURL) public onlyOwner {
        externalURL = _externalURL;
    }

    function setVendingPrice (uint _vendingPrice) public onlyOwner {
        vendingPrice = _vendingPrice;
    }

    function setRoyaltyInfo(address _receiver, uint96 _royaltyFeesInBips) public onlyOwner {
        _setDefaultRoyalty(_receiver, _royaltyFeesInBips);
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

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage, ERC721Royalty) {
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
        override(ERC721, ERC721Enumerable, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    
// function to verify and mint with geocode as tokenID

    function checkGeocode(uint256 geocode)
        internal
        pure
    {
        // verify the geocode is acceptable
        uint p = geocode % 10;
        require(p > 0, "Precision must be greater than 0");

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
                                    ' "image":"', imageURL, Strings.toString(geocode),'",',
                                    ' "animation_url":"', animationURL, Strings.toString(geocode),'",',
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
                                    '"seller_fee_basis_points": ', Strings.toString(royaltyFeesInBips),',',
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
        emit SubSpaceMinted(newGeocode);
    }

    // random function
    function randomMint(uint level, uint levelSign, uint n) internal returns(uint256[] memory geocodes) {
        for (uint i = 0; i < n; i++) {
            uint256 random = uint(keccak256(abi.encodePacked(block.number, block.timestamp, block.difficulty, msg.sender, level, i)));
            uint longitude = random % 3600;
            uint latitude = random / 3600 % 1800;
            uint geocode = level * 10**10 + levelSign * 10**9 + latitude * 10**5 + longitude * 10**1 + 1;
            if (_exists(geocode) || ! (auctionStartTime[geocode]==0)) {
                i = i - 1;
            } else {
                _safeMint(msg.sender, geocode);
                geocodes[i] = geocode;
            }
        }
    }

    // vending function
    function vending() external payable {
        require(msg.value > 0, "Value should be greater than 0");
        uint n = msg.value / vendingPrice;
        uint256[] memory geocodes = randomMint(0, 3, n);
        emit VendingHappend(geocodes);
    }

    function genesisAuction(uint256 geocode) external payable {
        require(msg.value > 0, "Value should be greater than 0");
        checkGeocode(geocode);
        require(geocode % 10 == 1, "precision should be 1 for genesis auction");
        require(!_exists(geocode), "Space is already minted");
        require(auctionStartTime[geocode]==0, "Space is already in auction");
        auctionStartTime[geocode] = block.timestamp;
        highestBid[geocode] = msg.value;
        highestBidder[geocode] = msg.sender;
        emit AuctionStarted(geocode, block.timestamp);

    }

    function putSubspaceToAuciton(uint256 geocode) external {
        checkGeocode(geocode);
        require (!_exists(geocode), "minted subspace dosen't need on chain auction"); 
        require(ownerOf(parent(geocode)) == msg.sender, "Only space owner can do auction");
        availableForAuction[geocode] = true;
        emit SubSpaceAuctionAllowed(geocode);
    }

    function holderAuction(uint256 geocode) external payable {
        require(msg.value > 0, "Value should be greater than 0");
        checkGeocode(geocode);
        require (!_exists(geocode), "minted subspace dosen't need on chain auction"); 
        require(ownerOf(parent(geocode)) == msg.sender, "Only space owner can do auction");
        require(availableForAuction[geocode], "Space is not available for auction");
        require(auctionStartTime[geocode]==0, "Space is already in auction");
        auctionStartTime[geocode] = block.timestamp;
        highestBid[geocode] = msg.value;
        highestBidder[geocode] = msg.sender;
        emit SubSpaceAuctionStarted(geocode, block.timestamp);
    }

    function parent(uint256 geocode) internal pure returns (uint256 parentGeocode) {
        uint p = geocode % 10;
        require(p>1, "You are naughty. Top spaces don't have parent");
        uint longitude = geocode / 100;
        uint latitude = geocode / 10**(p+5);
        uint levelSign = geocode / 10**(2*p + 7) % 10;
        uint level = geocode / 10**(2*p+8);
        parentGeocode = level*10**(2*p+6) + levelSign*10**(2*p+5) + latitude * 10**(p+3) + longitude * 10 + p-1;
    }

    function bid(uint256 geocode) external payable {
        require(msg.value > 0, "Value should be greater than 0");
        checkGeocode(geocode);
        require(!_exists(geocode), "Space is already minted");
        require(!(auctionStartTime[geocode]==0), "Space is not on auction");
        require(block.timestamp < (auctionStartTime[geocode] + auctionDuration), "Space auction is over");
        require(msg.value > highestBid[geocode], "Bid should be greater than highest bid");
        pendingReturns[geocode][highestBidder[geocode]] += highestBid[geocode];
        highestBid[geocode] = msg.value;
        highestBidder[geocode] = msg.sender;
        emit HighestBidIncreased(geocode, msg.sender, msg.value);

    }

    function withdraw(uint256 geocode) external returns (bool) {
        checkGeocode(geocode);
        uint amount = pendingReturns[geocode][msg.sender];
        if (amount > 0){
            pendingReturns[geocode][msg.sender] = 0;

            if(!payable(msg.sender).send(amount)){
                pendingReturns[geocode][msg.sender] = amount;
                return false;
            }
        }        
        return true;
    }

    function auctionEnd(uint256 geocode) external {
        checkGeocode(geocode);
        require(block.timestamp > auctionStartTime[geocode] + auctionDuration, "Space auction is not over");
        require(!_exists(geocode), "Space is already minted");
        _safeMint(highestBidder[geocode], geocode);
        emit AuctionEnded(geocode, highestBidder[geocode], highestBid[geocode]);
    }
}
