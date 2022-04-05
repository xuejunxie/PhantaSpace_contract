// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

//   _____  _                 _         _____                      
//  |  __ \| |               | |       / ____|                     
//  | |__) | |__   __ _ _ __ | |_ __ _| (___  _ __   __ _  ___ ___ 
//  |  ___/| '_ \ / _` | '_ \| __/ _` |\___ \| '_ \ / _` |/ __/ _ \
//  | |    | | | | (_| | | | | || (_| |____) | |_) | (_| | (_|  __/
//  |_|    |_| |_|\__,_|_| |_|\__\__,_|_____/| .__/ \__,_|\___\___|
//                                           | |                   
//                                           |_|                   


import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721RoyaltyUpgradeable.sol";


contract PhantaSpace is Initializable, ERC721Upgradeable, PausableUpgradeable, OwnableUpgradeable, UUPSUpgradeable, ERC721RoyaltyUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    string public baseURI;
    string public contractURI;

    uint public vendingPrice;
    uint public auctionDuration;
    uint public royaltyFeesInBips;

    mapping (uint256 => uint) public auctionEndTime;
    mapping (uint256 => mapping (address => uint)) public pendingReturns;
    mapping (uint256 => uint) public highestBid;
    mapping (uint256 => address) public highestBidder;
    mapping (uint256 => bool) public subspaceAvailableForAuction;

    event SpaceMinted(address to, uint256 geocode);
    event AuctionStarted(uint256 geocode, uint256 auctionEndTime, uint256 highestBid, address highestBidder);
    event AuctionExtended(uint256 geocode, uint256 newAuctionEndTime);
    event AuctionEnded(uint256 geocode, address highestBidder, uint256 highestBid);
    event HighestBidIncreased(uint256 geocode, address highestBidder, uint256 highestBid);
    event SubSpaceAuctionAllowed(uint256 geocode);
    event withDrawalRequested(uint256 geocode, address bidder, uint256 amount);

    function initialize( string memory _metadataURL, string memory _contractURI, uint _vendingPrice, uint _auctionDuration, uint96 _royaltyFeesInBips) initializer public {
        __ERC721_init("PhantaSpace", unicode"🌐");
        __Pausable_init();
        __Ownable_init();
        __UUPSUpgradeable_init();
        __ERC721Royalty_init();

        baseURI = _metadataURL;
        vendingPrice = _vendingPrice;
        auctionDuration = _auctionDuration;
        royaltyFeesInBips = _royaltyFeesInBips;
        _setDefaultRoyalty(owner(), _royaltyFeesInBips);
        contractURI = _contractURI;

    }


    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory _metadataURL) public onlyOwner{
        baseURI = _metadataURL;
    }

    function setContractURI (string memory _contractURI) public onlyOwner {
        contractURI = _contractURI;
    }

    function setVendingPrice (uint _vendingPrice) public onlyOwner {
        vendingPrice = _vendingPrice;
    }


    function setAuctionDuration(uint _auctionDuration) public onlyOwner {
        auctionDuration = _auctionDuration;
    }

    function setRoyaltyInfo(address _receiver, uint96 _royaltyFeesInBips) public onlyOwner {
        _setDefaultRoyalty(_receiver, _royaltyFeesInBips);
    }

    function exists(uint256 geocode) public view returns (bool) {
        return _exists(geocode);
    }


    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(address to, uint256 geocode)
        public
        onlyOwner
    {
        _safeMint(to, geocode);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override(ERC721Upgradeable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721RoyaltyUpgradeable)
    {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721RoyaltyUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // PhantaSpace functions

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
        emit SpaceMinted(ownerOf(geocode), newGeocode);
    }

    // random function
    function randomMint(uint level, uint levelSign, uint n) internal  {
        for (uint i = 0; i < n; i++) {
            uint256 random = uint(keccak256(abi.encodePacked(block.number, block.timestamp, block.difficulty, msg.sender, level, i)));
            uint longitude = random % 3600;
            uint latitude = random / 3600 % 1700 + 50;  // limit the venting range withing 50 to 1750 for better user experience.
            uint geocode = level * 10**10 + levelSign * 10**9 + latitude * 10**5 + longitude * 10**1 + 1;
            if (_exists(geocode) || ! (auctionEndTime[geocode]==0)) {
                n = n + 1;
            } else {
                _safeMint(msg.sender, geocode);
                emit SpaceMinted(msg.sender, geocode);
            }
        }
    }

    // vending function
    function vending() public payable {
        require(msg.value >= vendingPrice, "Value should be greater than vendingPrice");
        uint n = msg.value / vendingPrice;
        randomMint(0, 3, n); // vending on level 0 and 3 is for positive space
    }

    function genesisAuction(uint256 geocode) public payable {
        checkGeocode(geocode);
        require(msg.value > 0, "Value should be greater than 0");
        require(!_exists(geocode), "Space is already minted");
        require(auctionEndTime[geocode]==0, "Space is already in auction");

        if(geocode % 10 == 1){
            require(msg.value >= vendingPrice, "Auction starting bid should be greater than vending Price");
            
        } else {
            require(subspaceAvailableForAuction[parent(geocode)], "Space is not available for auction");
        }

        auctionEndTime[geocode] = block.timestamp + auctionDuration;
        highestBid[geocode] = msg.value;
        highestBidder[geocode] = msg.sender;
        emit AuctionStarted(geocode, auctionEndTime[geocode], highestBid[geocode], highestBidder[geocode]);
    }

    function putSubspaceToAuciton(uint256 geocode) public {
        checkGeocode(geocode);
        require(ownerOf(geocode) == msg.sender, "Only space owner can put subspace to auction");
        subspaceAvailableForAuction[geocode] = true;
        emit SubSpaceAuctionAllowed(geocode);
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

    function bid(uint256 geocode) public payable {
        require(msg.value > 0, "Value should be greater than 0");
        checkGeocode(geocode);
        require(!_exists(geocode), "Space is already minted");
        require(!(auctionEndTime[geocode]==0), "Space is not on auction");
        require(block.timestamp < auctionEndTime[geocode], "Space auction is over");
        
        uint newBid;
        // increase the bid 
        if(msg.sender == highestBidder[geocode]) {
        newBid = highestBid[geocode] + msg.value;
        } else {
        newBid = pendingReturns[geocode][msg.sender] + msg.value;
        }

        require(newBid > highestBid[geocode], "Bid should be greater than highestBid");
        
        pendingReturns[geocode][highestBidder[geocode]] = highestBid[geocode];
        pendingReturns[geocode][msg.sender] = 0;

        highestBid[geocode] = newBid;
        highestBidder[geocode] = msg.sender;

        emit HighestBidIncreased(geocode, msg.sender, newBid);

        if(block.timestamp > (auctionEndTime[geocode] - 10 * 60) ){
            auctionEndTime[geocode] += 10 * 60;  //  Any bids made in the last 10 minutes of an auction will extend each auction by 10 more minutes.
            emit AuctionExtended(geocode, auctionEndTime[geocode]);
        }


    }

    function withdraw(uint256 geocode) public returns (bool) {
        require(block.timestamp > auctionEndTime[geocode], "Please wait for space auction to end to withdraw");
        checkGeocode(geocode);
        uint amount = pendingReturns[geocode][msg.sender];
        require(amount > 0, "You have no pending returns");
        pendingReturns[geocode][msg.sender] = 0;

        if(!payable(msg.sender).send(amount)){
            pendingReturns[geocode][msg.sender] = amount;
            return false;
        }
        emit withDrawalRequested( geocode, msg.sender, amount);
        return true;
    }

    function genesisAuctionEnd(uint256 geocode) public {
        checkGeocode(geocode);
        require(block.timestamp > auctionEndTime[geocode], "Space auction is not over");
        require(!_exists(geocode), "Space is already minted");

        if(geocode % 10 == 1){

        _safeMint(highestBidder[geocode], geocode);
       
        } else {
        
        _safeMint(highestBidder[geocode], geocode);
        
        uint256 parentGeocode = parent(geocode);
        uint amount = highestBid[geocode] / 10000 * (10000 - royaltyFeesInBips);  //  royaltyFeesInBips / 10000 % of the bid is the royalty fees
        payable(ownerOf(parentGeocode)).transfer(amount);

        }

        emit AuctionEnded(geocode, highestBidder[geocode], highestBid[geocode]);

    }



    function ownerWithdraw(uint amount) public onlyOwner returns(bool) {
        require(amount <= address(this).balance);
        payable(owner()).transfer(amount);
        return true;

    }
}