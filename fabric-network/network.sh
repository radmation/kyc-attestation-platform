#!/bin/bash
# Based on Hyperledger Fabric test-network but customized for KYC platform

# Set environment variables
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/

# Channel configuration
CHANNEL_NAME="kycchannel"
CHAINCODE_NAME="kycattestation"
CHAINCODE_PATH="../chaincode/kyc-attestation"
CHAINCODE_LANGUAGE="go"
CC_VERSION="1.0"
CC_SEQUENCE="1"

function createChannel() {
    echo "Creating KYC channel..."
    
    # Generate channel configuration
    configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/$CHANNEL_NAME.tx -channelID $CHANNEL_NAME
    
    # Create channel
    peer channel create -o localhost:7050 -c $CHANNEL_NAME --ordererTLSHostnameOverride orderer.example.com -f ./channel-artifacts/$CHANNEL_NAME.tx --outputBlock ./channel-artifacts/$CHANNEL_NAME.block --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    
    # Join channel
    peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block
    
    echo "KYC channel created successfully"
}

function deployChaincode() {
    echo "Deploying KYC attestation chaincode..."
    
    # Package chaincode
    peer lifecycle chaincode package $CHAINCODE_NAME.tar.gz --path $CHAINCODE_PATH --lang $CHAINCODE_LANGUAGE --label ${CHAINCODE_NAME}_${CC_VERSION}
    
    # Install chaincode on peer
    peer lifecycle chaincode install $CHAINCODE_NAME.tar.gz
    
    # Get package ID
    peer lifecycle chaincode queryinstalled >&log.txt
    PACKAGE_ID=$(sed -n "/${CHAINCODE_NAME}_${CC_VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    
    # Approve chaincode definition
    peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --version $CC_VERSION --package-id $PACKAGE_ID --sequence $CC_SEQUENCE --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    
    # Commit chaincode definition
    peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --version $CC_VERSION --sequence $CC_SEQUENCE --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
    
    echo "KYC attestation chaincode deployed successfully"
}

# Main execution
case $1 in
    up)
        echo "Starting KYC Fabric network..."
        ./network.sh up createChannel
        createChannel
        ;;
    deployCC)
        deployChaincode
        ;;
    down)
        echo "Stopping KYC Fabric network..."
        ./network.sh down
        ;;
    *)
        echo "Usage: $0 {up|deployCC|down}"
        exit 1
        ;;
esac 