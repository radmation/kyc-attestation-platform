#!/bin/bash

# Environment setup
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/

CHANNEL_NAME="kycchannel"
CHAINCODE_NAME="kycattestation"
CHAINCODE_PATH="../chaincode/kyc-attestation"
CC_VERSION="1.0"
CC_SEQUENCE="1"

echo "Deploying KYC Attestation Chaincode..."

# Package chaincode
echo "Packaging chaincode..."
peer lifecycle chaincode package ${CHAINCODE_NAME}.tar.gz \
    --path ${CHAINCODE_PATH} \
    --lang golang \
    --label ${CHAINCODE_NAME}_${CC_VERSION}

# Install chaincode
echo "Installing chaincode on peers..."
peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz

# Get package ID
PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json | jq -r ".installed_chaincodes[0].package_id")
echo "Package ID: $PACKAGE_ID"

# Approve chaincode definition for Org1
echo "Approving chaincode definition for Org1..."
peer lifecycle chaincode approveformyorg \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $CC_VERSION \
    --package-id $PACKAGE_ID \
    --sequence $CC_SEQUENCE \
    --tls \
    --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Check commit readiness
echo "Checking commit readiness..."
peer lifecycle chaincode checkcommitreadiness \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $CC_VERSION \
    --sequence $CC_SEQUENCE \
    --tls \
    --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    --output json

# Commit chaincode definition
echo "Committing chaincode definition..."
peer lifecycle chaincode commit \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $CC_VERSION \
    --sequence $CC_SEQUENCE \
    --tls \
    --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt

echo "Chaincode deployment completed successfully!" 