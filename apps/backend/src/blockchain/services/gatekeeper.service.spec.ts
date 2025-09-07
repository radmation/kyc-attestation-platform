import { Test, TestingModule } from '@nestjs/testing';
import { GatekeeperService, ComplianceCheckResult } from './gatekeeper.service';
import { FabricBlockchainProvider } from '../providers/fabric-blockchain.provider';

describe('GatekeeperService', () => {
  let service: GatekeeperService;
  let fabricProvider: jest.Mocked<FabricBlockchainProvider>;

  beforeEach(async () => {
    // Create mock for FabricBlockchainProvider
    const mockFabricProvider = {
      invokeChaincode: jest.fn(),
      queryChaincode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GatekeeperService,
        {
          provide: FabricBlockchainProvider,
          useValue: mockFabricProvider,
        },
      ],
    }).compile();

    service = module.get<GatekeeperService>(GatekeeperService);
    fabricProvider = module.get<FabricBlockchainProvider>(
      FabricBlockchainProvider,
    ) as jest.Mocked<FabricBlockchainProvider>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkCompliance', () => {
    it('should return compliance check result', async () => {
      const senderAddress = '0x123456789';
      const receiverAddress = '0x987654321';

      const result = await service.checkCompliance(
        senderAddress,
        receiverAddress,
      );

      expect(result).toBeDefined();
      expect(result.sender).toBe(senderAddress);
      expect(result.receiver).toBe(receiverAddress);
      expect(result.checkedAt).toBeDefined();
      expect(typeof result.isCompliant).toBe('boolean');
    });

    it('should handle different addresses', async () => {
      const result1 = await service.checkCompliance('0x111', '0x222');
      const result2 = await service.checkCompliance('0x333', '0x444');

      expect(result1.sender).toBe('0x111');
      expect(result1.receiver).toBe('0x222');
      expect(result2.sender).toBe('0x333');
      expect(result2.receiver).toBe('0x444');
    });
  });

  describe('getPauseState', () => {
    it('should return pause state', async () => {
      const result = await service.getPauseState();

      expect(result).toBeDefined();
      expect(typeof result.paused).toBe('boolean');
    });
  });

  describe('pauseContract', () => {
    it('should pause the contract without throwing', async () => {
      await expect(service.pauseContract()).resolves.not.toThrow();
    });
  });

  describe('unpauseContract', () => {
    it('should unpause the contract without throwing', async () => {
      await expect(service.unpauseContract()).resolves.not.toThrow();
    });
  });

  describe('isTransactionCompliant', () => {
    it('should return boolean result', async () => {
      const result = await service.isTransactionCompliant('0x123', '0x456');

      expect(typeof result).toBe('boolean');
    });
  });

  describe('getComplianceDetails', () => {
    it('should return detailed compliance information', async () => {
      const result = await service.getComplianceDetails('0x123', '0x456');

      expect(result).toBeDefined();
      expect(typeof result.isCompliant).toBe('boolean');
      expect(result.details).toBeDefined();
      expect(result.recommendation).toBeDefined();
      expect(typeof result.recommendation).toBe('string');
    });

    it('should provide appropriate recommendation for non-compliant transactions', async () => {
      const result = await service.getComplianceDetails('0x123', '0x456');

      if (!result.isCompliant) {
        expect(result.recommendation).toContain('blocked');
      } else {
        expect(result.recommendation).toContain('proceed');
      }
    });
  });

  describe('Integration Test Scenarios', () => {
    it('should handle multiple sequential compliance checks', async () => {
      const addresses = [
        ['0x111', '0x222'],
        ['0x333', '0x444'],
        ['0x555', '0x666'],
      ];

      const results = await Promise.all(
        addresses.map(([sender, receiver]) =>
          service.checkCompliance(sender, receiver),
        ),
      );

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.sender).toBe(addresses[index][0]);
        expect(result.receiver).toBe(addresses[index][1]);
      });
    });

    it('should handle pause state check after pause operations', async () => {
      // Initial state
      const initialState = await service.getPauseState();
      expect(initialState).toBeDefined();

      // Pause operation
      await service.pauseContract();

      // Unpause operation
      await service.unpauseContract();

      // Final state check
      const finalState = await service.getPauseState();
      expect(finalState).toBeDefined();
    });

    it('should provide consistent results for same addresses', async () => {
      const sender = '0xConsistentSender';
      const receiver = '0xConsistentReceiver';

      const result1 = await service.checkCompliance(sender, receiver);
      const result2 = await service.checkCompliance(sender, receiver);

      expect(result1.sender).toBe(result2.sender);
      expect(result1.receiver).toBe(result2.receiver);
      expect(result1.isCompliant).toBe(result2.isCompliant);
    });
  });

  describe('Error Handling', () => {
    it('should handle service initialization', () => {
      expect(service).toBeInstanceOf(GatekeeperService);
    });

    it('should handle empty addresses gracefully', async () => {
      const result = await service.checkCompliance('', '');
      expect(result).toBeDefined();
      expect(result.sender).toBe('');
      expect(result.receiver).toBe('');
    });
  });
});
