import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 1500,   // concurrent users
  duration: '90s'
};

export default function () {
  http.get('https://www.massivcart.com/');
  sleep(1);
}

// k6 run loadtest.js is the command to run the load test