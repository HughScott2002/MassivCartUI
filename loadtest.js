import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 1500,   // concurrent users
  duration: '30s'
};

export default function () {
  http.get('https://massivecart-api-k6pf2424tq-uc.a.run.app/');
  sleep(1);
}

// k6 run loadtest.js is the command to run the load test