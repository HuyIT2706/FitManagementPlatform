import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  let mockPrismaService: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    mockPrismaService = {
      $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  describe('getHealth', () => {
    it('should return health payload with ok status', () => {
      const result = appController.getHealth();
      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('NutriCore API');
      expect(typeof result.timestamp).toBe('string');
    });
  });

  describe('getHealthCheck', () => {
    it('should return 200 with uptime and ok status when db connected', async () => {
      const jsonMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
      const res = { status: statusMock } as any;

      await appController.getHealthCheck(res);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ok',
          database: 'connected',
        }),
      );
    });
  });
});
