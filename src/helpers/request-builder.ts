import axios from 'axios';

export function requestBuilder({ url, method = 'get', headers = {}, body }) {
  const response = await axios.request({
    url,
    method,
    headers,
    data: body
  });

  return response;
}
