import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkoutService } from './workout.service';

interface PrismaWorkoutMock {
  exerciseLibrary: {
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
  };
  scheduleExercise: {
    findUnique: jest.Mock;
  };
}

describe('WorkoutService - getExerciseById', () => {
  let service: WorkoutService;
  let prismaMock: PrismaWorkoutMock;

  beforeEach(async () => {
    prismaMock = {
      exerciseLibrary: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      scheduleExercise: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<WorkoutService>(WorkoutService);
  });

  it('returns exercise and ranked similar exercises by library id', async () => {
    const mainExercise = {
      id: 'ex-bench',
      name: 'Barbell Bench Press',
      category: 'Sức mạnh',
      level: 'mới bắt đầu',
      mechanic: 'phức hợp (compound)',
      equipment: 'thanh đòn',
      primaryMuscles: ['cơ ngực'],
      secondaryMuscles: ['cơ vai'],
      instructions: ['Bước 1'],
      setupImageUrl: 'setup.jpg',
      startImageUrl: 'start.jpg',
    };

    const similarA = {
      ...mainExercise,
      id: 'ex-other',
      name: 'Cable Fly',
      mechanic: 'cô lập (isolation)',
      category: 'Khác',
    };
    const similarB = {
      ...mainExercise,
      id: 'ex-incline',
      name: 'Incline Dumbbell Press',
    };

    prismaMock.exerciseLibrary.findUnique.mockResolvedValueOnce(mainExercise);
    prismaMock.exerciseLibrary.findMany.mockResolvedValueOnce([
      similarA,
      similarB,
    ]);

    const result = await service.getExerciseById('ex-bench');

    expect(result.exercise.id).toBe('ex-bench');
    expect(result.similarExercises).toHaveLength(2);
    expect(result.similarExercises[0].id).toBe('ex-incline');
  });

  it('resolves exercise via ScheduleExercise relation or case-insensitive name', async () => {
    const linkedExercise = {
      id: 'ex-squat',
      name: 'Barbell Squat',
      category: 'Sức mạnh',
      level: 'trung cấp',
      mechanic: 'phức hợp (compound)',
      equipment: 'thanh đòn',
      primaryMuscles: ['cơ đùi trước'],
      secondaryMuscles: [],
      instructions: [],
      setupImageUrl: null,
      startImageUrl: null,
    };

    prismaMock.exerciseLibrary.findUnique.mockResolvedValueOnce(null);
    prismaMock.scheduleExercise.findUnique.mockResolvedValueOnce({
      id: 'se-1',
      exercise: linkedExercise,
    });

    const fromSchedule = await service.getExerciseById('se-1');
    expect(fromSchedule.exercise.id).toBe('ex-squat');

    prismaMock.exerciseLibrary.findUnique.mockResolvedValueOnce(null);
    prismaMock.scheduleExercise.findUnique.mockResolvedValueOnce(null);
    prismaMock.exerciseLibrary.findFirst.mockResolvedValueOnce(linkedExercise);

    const fromName = await service.getExerciseById('barbell squat');
    expect(fromName.exercise.name).toBe('Barbell Squat');
  });

  it('throws NotFoundException when exercise does not exist', async () => {
    prismaMock.exerciseLibrary.findUnique.mockResolvedValueOnce(null);
    prismaMock.scheduleExercise.findUnique.mockResolvedValueOnce(null);
    prismaMock.exerciseLibrary.findFirst.mockResolvedValueOnce(null);

    await expect(service.getExerciseById('missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});
