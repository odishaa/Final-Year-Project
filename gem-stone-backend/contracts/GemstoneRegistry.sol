// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GemstoneRegistry {
    
    struct Gemstone {
        string gemId;
        string name;
        string gemType;
        uint256 carats;
        string color;
        string clarity;
        string cut;
        string origin;
        address owner;
        bool exists;
        uint256 timestamp;
    }
    
    struct Certificate {
        string certificateNumber;
        string certifiedBy;
        uint256 certificationDate;
        bool certified;
    }
    
    // Mappings
    mapping(string => Gemstone) public gemstones;
    mapping(string => Certificate) public certificates;
    mapping(address => bool) public ngjaOfficers;           
    
    // Arrays for enumeration
    string[] public gemstoneIds;
    
    // Events
    event GemstoneRegistered(string gemId, address owner, uint256 timestamp);
    event OwnershipTransferred(string gemId, address from, address to, uint256 timestamp);
    event CertificationRequested(string gemId, address owner, uint256 timestamp);
    event GemstoneCertified(string gemId, string certificateNumber, uint256 timestamp);
    
    // Owner
    address public contractOwner;
    
    constructor() {
        contractOwner = msg.sender;
        ngjaOfficers[msg.sender] = true; // Contract deployer is first NGJA officer
    }
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == contractOwner, "Only contract owner can call this");
        _;
    }
    
    modifier onlyNGJAOfficer() {
        require(ngjaOfficers[msg.sender], "Only NGJA officers can certify");
        _;
    }
    
    modifier gemstoneExists(string memory gemId) {
        require(gemstones[gemId].exists, "Gemstone does not exist");
        _;
    }
    
    modifier onlyGemstoneOwner(string memory gemId) {
        require(gemstones[gemId].owner == msg.sender, "Not the gemstone owner");
        _;
    }
    
    // Functions
    
    // Add NGJA Officer
    function addNGJAOfficer(address officer) public onlyOwner {
        ngjaOfficers[officer] = true;
    }
    
    // Remove NGJA Officer
    function removeNGJAOfficer(address officer) public onlyOwner {
        ngjaOfficers[officer] = false;
    }
    
    // Register Gemstone
    function registerGemstone(
        string memory gemId,
        string memory name,
        string memory gemType,
        uint256 carats,
        string memory color,
        string memory clarity,
        string memory cut,
        string memory origin
    ) public returns (bool) {
        require(!gemstones[gemId].exists, "Gemstone already registered");
        
        gemstones[gemId] = Gemstone({
            gemId: gemId,
            name: name,
            gemType: gemType,
            carats: carats,
            color: color,
            clarity: clarity,
            cut: cut,
            origin: origin,
            owner: msg.sender,
            exists: true,
            timestamp: block.timestamp
        });
        
        gemstoneIds.push(gemId);
        
        emit GemstoneRegistered(gemId, msg.sender, block.timestamp);
        return true;
    }
    
    // Transfer Ownership
    function transferOwnership(string memory gemId, address newOwner) 
        public 
        gemstoneExists(gemId) 
        onlyGemstoneOwner(gemId) 
        returns (bool) 
    {
        require(newOwner != address(0), "Invalid new owner address");
        
        address previousOwner = gemstones[gemId].owner;
        gemstones[gemId].owner = newOwner;
        
        emit OwnershipTransferred(gemId, previousOwner, newOwner, block.timestamp);
        return true;
    }
    
    // Submit for Certification (anyone can call but must own the gemstone)
    function submitForCertification(string memory gemId) 
        public 
        gemstoneExists(gemId) 
        onlyGemstoneOwner(gemId) 
        returns (bool) 
    {
        emit CertificationRequested(gemId, msg.sender, block.timestamp);
        return true;
    }
    
    // Certify Gemstone (only NGJA officer)
    function certifyGemstone(
        string memory gemId,
        string memory certificateNumber,
        string memory certifiedBy
    ) public onlyNGJAOfficer gemstoneExists(gemId) returns (bool) {
        require(!certificates[gemId].certified, "Already certified");
        
        certificates[gemId] = Certificate({
            certificateNumber: certificateNumber,
            certifiedBy: certifiedBy,
            certificationDate: block.timestamp,
            certified: true
        });
        
        emit GemstoneCertified(gemId, certificateNumber, block.timestamp);
        return true;
    }
    
    // Get Gemstone
    function getGemstone(string memory gemId) 
        public 
        view 
        gemstoneExists(gemId) 
        returns (
            string memory name,
            string memory gemType,
            uint256 carats,
            string memory color,
            string memory clarity,
            string memory cut,
            string memory origin,
            address owner,
            uint256 timestamp
        ) 
    {
        Gemstone memory gem = gemstones[gemId];
        return (
            gem.name,
            gem.gemType,
            gem.carats,
            gem.color,
            gem.clarity,
            gem.cut,
            gem.origin,
            gem.owner,
            gem.timestamp
        );
    }
    
    // Get Certificate
    function getCertificate(string memory gemId) 
        public 
        view 
        returns (
            string memory certificateNumber,
            string memory certifiedBy,
            uint256 certificationDate,
            bool certified
        ) 
    {
        Certificate memory cert = certificates[gemId];
        return (
            cert.certificateNumber,
            cert.certifiedBy,
            cert.certificationDate,
            cert.certified
        );
    }
    
    // Verify Certificate by Number
    function verifyCertificateNumber(string memory gemId, string memory certNumber) 
        public 
        view 
        returns (bool) 
    {
        if (!certificates[gemId].certified) return false;
        return keccak256(bytes(certificates[gemId].certificateNumber)) == keccak256(bytes(certNumber));
    }
    
    // Get total gemstones
    function getTotalGemstones() public view returns (uint256) {
        return gemstoneIds.length;
    }
    
    // Get gemstone ID by index
    function getGemstoneIdByIndex(uint256 index) public view returns (string memory) {
        require(index < gemstoneIds.length, "Index out of bounds");
        return gemstoneIds[index];
    }
}