import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 }, // Ramp up to 10 users
    { duration: '3m', target: 10 }, // Stay at 10 users
    { duration: '1m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<400'], // 95% of requests must complete below 400ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.BACKEND_URL || 'http://localhost:3000';

export default function () {
  // Test 1: Get health check
  const healthResponse = http.get(`${BASE_URL}/health`);
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);

  // Test 2: Get forum categories
  const categoriesResponse = http.get(`${BASE_URL}/forum/categories`);
  check(categoriesResponse, {
    'categories status is 200': (r) => r.status === 200,
    'categories response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1);

  // Test 3: Get forum threads
  const threadsResponse = http.get(`${BASE_URL}/forum/threads?page=1&limit=10`);
  check(threadsResponse, {
    'threads status is 200': (r) => r.status === 200,
    'threads response time < 400ms': (r) => r.timings.duration < 400,
  });

  sleep(1);

  // Test 4: Search threads
  const searchResponse = http.get(`${BASE_URL}/forum/search?q=test&page=1&limit=5`);
  check(searchResponse, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test 5: Get specific thread (if exists)
  const threadId = 1; // Assuming thread with ID 1 exists
  const threadResponse = http.get(`${BASE_URL}/forum/threads/${threadId}`);
  check(threadResponse, {
    'thread detail status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'thread detail response time < 400ms': (r) => r.timings.duration < 400,
  });

  sleep(1);

  // Test 6: Get posts for a thread
  const postsResponse = http.get(`${BASE_URL}/forum/threads/${threadId}/posts?page=1&limit=10`);
  check(postsResponse, {
    'posts status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'posts response time < 400ms': (r) => r.timings.duration < 400,
  });

  sleep(2);
}

export function handleSummary(data) {
  return {
    'perf/k6/results.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
