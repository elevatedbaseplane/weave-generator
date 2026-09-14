import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const types={'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'};
http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname),file=path.resolve(root,pathname==='/'?'index.html':`.${pathname}`);
  if(!file.startsWith(root+path.sep)){response.writeHead(403);response.end();return;}
  fs.readFile(file,(error,data)=>{if(error){response.writeHead(404);response.end('Not found');return;}response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');response.setHeader('Cache-Control','no-store');response.end(data);});
}).listen(Number(process.argv[2]||43828),'127.0.0.1',()=>console.log(`Static preview: http://127.0.0.1:${process.argv[2]||43828}`));
