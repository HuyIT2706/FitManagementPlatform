import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
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
    it('should return uptime and ok status', () => {
      const result = appController.getHealthCheck();
      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(typeof result.uptime).toBe('number');
      expect(typeof result.timestamp).toBe('string');
    });
  });
});
