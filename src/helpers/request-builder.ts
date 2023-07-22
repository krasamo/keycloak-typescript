import axios from 'axios';

export async function requestBuilder(
  { url, method = 'get', headers = {}, body },
  params?
) {
  const response = await axios.request({
    url,
    method,
    headers,
    data: body,
    params: params
  });

  return response;
}
