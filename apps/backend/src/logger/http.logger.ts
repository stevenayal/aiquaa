import pinoHttp from 'pino-http';

export const httpLogger = pinoHttp({
  genReqId: (req) => (req as any).requestId, // usa el rid del middleware
  serializers: {
    req(req) {
      return {
        id: (req as any).requestId,
        method: req.method,
        url: req.url
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode
      };
    },
  },
});
