import { expect, it } from 'vitest';
import { requestOrigin } from './request-origin';
it.each([
  ['http://localhost:3000/auth/callback','127.0.0.1:3000','http://127.0.0.1:3000'],
  ['http://localhost:3000/auth/callback','localhost:3000','http://localhost:3000'],
  ['http://localhost:3000/auth/callback','evil.example:3000','http://localhost:3000'],
  ['http://localhost:3000/auth/callback','127.0.0.1:8080','http://localhost:3000'],
  ['http://localhost:3000/auth/callback','evil@127.0.0.1:3000','http://localhost:3000'],
  ['https://umbra.example/auth/callback','evil.example','https://umbra.example'],
])('preserves the safe request origin for %s and %s',(url,host,expected)=>{expect(requestOrigin(new Request(url,{headers:{host}}))).toBe(expected);});
