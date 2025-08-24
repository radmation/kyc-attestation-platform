import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Gateway, Wallets, Network, Contract } from 'fabric-network';
import * as FabricCAServices from 'fabric-ca-client';
import * as fs from 'fs';
import * as path from 'path';

export interface AttestationData {
  id: string;
  profileId: string;
  walletId: string;
  metadataUri: string;
  status?: string;
  issuedAt?: string;
  expiresAt?: string;
}

export interface FabricEventData {
  eventName: string;
  chaincodeId: string;
  txId: string;
  payload: any;
}

@Injectable()
export class FabricService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FabricService.name);
  private gateway!: Gateway;
  private network!: Network;
  private contract!: Contract;
  private isConnected = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      await this.initializeFabricConnection();
      await this.setupEventListeners();
    } catch (error) {
      this.logger.error('Failed to initialize Fabric connection:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async initializeFabricConnection() {
    try {
      // Load connection profile
      const ccpPath = this.configService.get<string>('FABRIC_CONNECTION_PROFILE_PATH') ||
        path.resolve(__dirname, '..', '..', '..', '..', 'fabric-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
      
      if (!fs.existsSync(ccpPath)) {
        throw new Error(`Connection profile not found at: ${ccpPath}`);
      }

      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      // Create a new file system based wallet for managing identities
      const walletPath = this.configService.get<string>('FABRIC_WALLET_PATH') ||
        path.join(process.cwd(), 'wallet');
      
      const wallet = await Wallets.newFileSystemWallet(walletPath);

      // Check to see if we've already enrolled the user
      const identity = await wallet.get('appUser');
      if (!identity) {
        throw new Error('An identity for the user "appUser" does not exist in the wallet. Please run enrollment first.');
      }

      // Create a new gateway for connecting to our peer node
      this.gateway = new Gateway();
      await this.gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true }
      });

      // Get the network (channel) our contract is deployed to
      const channelName = this.configService.get<string>('FABRIC_NETWORK_NAME') || 'kycchannel';
      this.network = await this.gateway.getNetwork(channelName);

      // Get the contract from the network
      const chaincodeName = this.configService.get<string>('FABRIC_CHAINCODE_NAME') || 'kycattestation';
      this.contract = this.network.getContract(chaincodeName);

      this.isConnected = true;
      this.logger.log('Successfully connected to Fabric network');
    } catch (error) {
      this.logger.error('Failed to initialize Fabric connection:', error);
      throw error;
    }
  }

  private async setupEventListeners() {
    if (!this.isConnected) {
      throw new Error('Fabric connection not established');
    }

    try {
      // TODO: Fix chaincode event listener implementation
      // Listen for chaincode events
      // const listener = await this.contract.addContractListener((event) => {
      //   this.handleFabricEvent({
      //     eventName: event.eventName,
      //     chaincodeId: event.chaincodeId,
      //     txId: event.getTransactionEvent().transactionId,
      //     payload: event.payload ? JSON.parse(event.payload.toString()) : null,
      //   });
      // });

      this.logger.log('Fabric event listeners configured');
    } catch (error) {
      this.logger.error('Failed to setup event listeners:', error);
    }
  }

  private handleFabricEvent(eventData: FabricEventData) {
    this.logger.log(`Received Fabric event: ${eventData.eventName}`, {
      txId: eventData.txId,
      payload: eventData.payload,
    });

    // Here you can add logic to handle different types of events
    // For example, update database, send notifications, etc.
  }

  async createAttestation(attestationData: AttestationData): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Fabric connection not established');
    }

    try {
      const result = await this.contract.submitTransaction(
        'CreateAttestation',
        attestationData.id,
        attestationData.profileId,
        attestationData.walletId,
        attestationData.metadataUri
      );

      this.logger.log(`Attestation created: ${attestationData.id}`);
      return result.toString();
    } catch (error) {
      this.logger.error('Failed to create attestation:', error);
      throw error;
    }
  }

  async getAttestation(id: string): Promise<AttestationData> {
    if (!this.isConnected) {
      throw new Error('Fabric connection not established');
    }

    try {
      const result = await this.contract.evaluateTransaction('GetAttestation', id);
      const attestation = JSON.parse(result.toString());
      
      this.logger.log(`Retrieved attestation: ${id}`);
      return attestation;
    } catch (error) {
      this.logger.error('Failed to get attestation:', error);
      throw error;
    }
  }

  async updateAttestationStatus(id: string, status: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Fabric connection not established');
    }

    try {
      const result = await this.contract.submitTransaction('UpdateAttestationStatus', id, status);
      
      this.logger.log(`Attestation status updated: ${id} -> ${status}`);
      return result.toString();
    } catch (error) {
      this.logger.error('Failed to update attestation status:', error);
      throw error;
    }
  }

  async revokeAttestation(id: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Fabric connection not established');
    }

    try {
      const result = await this.contract.submitTransaction('RevokeAttestation', id);
      
      this.logger.log(`Attestation revoked: ${id}`);
      return result.toString();
    } catch (error) {
      this.logger.error('Failed to revoke attestation:', error);
      throw error;
    }
  }

  async getAttestationsByWallet(walletId: string): Promise<AttestationData[]> {
    if (!this.isConnected) {
      throw new Error('Fabric connection not established');
    }

    try {
      const result = await this.contract.evaluateTransaction('GetAttestationsByWallet', walletId);
      const attestations = JSON.parse(result.toString());
      
      this.logger.log(`Retrieved ${attestations.length} attestations for wallet: ${walletId}`);
      return attestations;
    } catch (error) {
      this.logger.error('Failed to get attestations by wallet:', error);
      throw error;
    }
  }

  async getAttestationHistory(id: string): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('Fabric connection not established');
    }

    try {
      const result = await this.contract.evaluateTransaction('GetAttestationHistory', id);
      const history = JSON.parse(result.toString());
      
      this.logger.log(`Retrieved history for attestation: ${id}`);
      return history;
    } catch (error) {
      this.logger.error('Failed to get attestation history:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.gateway) {
      await this.gateway.disconnect();
      this.isConnected = false;
      this.logger.log('Disconnected from Fabric network');
    }
  }

  isHealthy(): boolean {
    return this.isConnected;
  }
} 