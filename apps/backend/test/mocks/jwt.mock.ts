export const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
};

export const mockJwtPayload = {
  email: 'test@example.com',
  sub: 1,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
};

export const mockAccessToken = 'mock-access-token';
export const mockRefreshToken = 'mock-refresh-token';

export function setupJwtMocks() {
  mockJwtService.sign.mockImplementation((payload, options) => {
    if (options?.expiresIn === '7d') {
      return mockRefreshToken;
    }
    return mockAccessToken;
  });

  mockJwtService.verify.mockImplementation((token) => {
    if (token === mockRefreshToken || token === mockAccessToken) {
      return mockJwtPayload;
    }
    throw new Error('Invalid token');
  });
}
