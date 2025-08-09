import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../../src/cache/cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get cached value', async () => {
    const mockValue = { data: 'test' };
    jest.spyOn(cacheManager, 'get').mockResolvedValue(mockValue);

    const result = await service.get('test-key');
    expect(result).toEqual(mockValue);
    expect(cacheManager.get).toHaveBeenCalledWith('forum:test-key');
  });

  it('should set cached value', async () => {
    const mockValue = { data: 'test' };
    jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined);

    await service.set('test-key', mockValue, 60);
    expect(cacheManager.set).toHaveBeenCalledWith('forum:test-key', mockValue, 60);
  });

  it('should delete cached value', async () => {
    jest.spyOn(cacheManager, 'del').mockResolvedValue(undefined);

    await service.del('test-key');
    expect(cacheManager.del).toHaveBeenCalledWith('forum:test-key');
  });

  it('should get or set value', async () => {
    const mockValue = { data: 'test' };
    const mockFn = jest.fn().mockResolvedValue(mockValue);
    
    // First call - cache miss
    jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
    jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined);

    const result = await service.getOrSet('test-key', mockFn, 60);
    
    expect(result).toEqual(mockValue);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(cacheManager.set).toHaveBeenCalledWith('forum:test-key', mockValue, 60);

    // Second call - cache hit
    jest.spyOn(cacheManager, 'get').mockResolvedValue(mockValue);
    
    const cachedResult = await service.getOrSet('test-key', mockFn, 60);
    expect(cachedResult).toEqual(mockValue);
    expect(mockFn).toHaveBeenCalledTimes(1); // Should not be called again
  });
});
