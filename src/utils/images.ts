import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { promisify } from 'util';
import * as stream from 'stream';

const finished = promisify(stream.finished);
const dir = path.join('images', 'image.png');
export async function save(url: string) {
  const writer = fs.createWriteStream(dir);
  return axios({
    method: 'get',
    url: url,
    responseType: 'stream',
  }).then(response => {
    response.data.pipe(writer);
    return finished(writer);
  });
}
