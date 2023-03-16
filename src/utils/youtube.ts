import axios from 'axios';
import { YOUTUBE_KEY } from '../../config';

const youtube_api = 'https://www.googleapis.com/youtube/v3/search';
const youtube_url = 'https://www.youtube.com/watch?v=';

export async function getLinkUrl(search: string) {
  try {
    console.log(`Searching for ${search}`);
    const { data } = await axios.get(youtube_api, {
      params: {
        part: 'snippet',
        q: search,
        type: 'video',
        maxResults: 10,
        key: YOUTUBE_KEY,
      },
    });

    return `${youtube_url}${data.items[0].id.videoId}`;
  } catch (error) {
    throw error;
  }
}