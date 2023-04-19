const axios = require('axios');

const GET_DATA_URL = 'https://app.ziqni.com/api';
const get_data_space = '<<SPACE-NAME>>';
const get_data_api_key = '<<API-KEY>>';

const SPACE = 'first-space'

const POST_DATA_URL = 'https://api.ziqni.com';
const post_data_token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJIdkdPZHNISUhLY2NNak1JRkVsZjdHTEMwUmswUHRYN1NlcV9zbW9CVUdJIn0.eyJleHAiOjE2ODE3MzQ3NDgsImlhdCI6MTY4MTczNDQ0OCwiYXV0aF90aW1lIjoxNjgxNzExMzk0LCJqdGkiOiJhMzZhZDQ2Mi04ZTM2LTQ1YWItYjJiNS0wMTgwOTVhOTk1NmEiLCJpc3MiOiJodHRwczovL2lkZW50aXR5LnppcW5pLmNvbS9yZWFsbXMvemlxbmkiLCJzdWIiOiIyZTBjN2IyOC0xMWI2LTQ3MDUtYTY0YS1kMDY4OTM1MzExZDQiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJmaXJzdC1zcGFjZS56aXFuaS5hcHAiLCJub25jZSI6IjY4Nzk0MDhjLWNiZjMtNDEzOS04MDk4LTQxYzAzZDY3YzA4MiIsInNlc3Npb25fc3RhdGUiOiI4NzI0YjU0MC1kYTk0LTRmOGMtYjBhZi03NGU0NjE3NTE1OTkiLCJyZXNvdXJjZV9hY2Nlc3MiOnsiemlxbmktYWFwaSI6eyJyb2xlcyI6WyJWaWV3U3BhY2VzIiwiVmlld0NvbnRlc3QiLCJPd25lciIsIk1hbmFnZU1lc3NhZ2VzIiwiVmlld1Byb2R1Y3RzIiwiQWRtaW5NZXNzYWdlcyIsIlZpZXdVT00iLCJWaWV3UnVsZXMiLCJTdXBlckFkbWluIiwiVmlld0N1c3RvbUZpZWxkcyIsIlZpZXdDb21wZXRpdGlvbnMiLCJBZG1pblVzZXIiLCJNYW5hZ2VSZXdhcmRzIiwiVmlld1RhZ3MiLCJNYW5hZ2VDb21wZXRpdGlvbiIsIlZpZXdNZXNzYWdlcyIsIk1hbmFnZUZpbGVPYmplY3RSZXAiLCJNYW5hZ2VQcm9kdWN0cyIsIlZpZXdBd2FyZHMiLCJWaWV3T2JqZWN0cyIsIkFkbWluUHJvZHVjdHMiLCJNYW5hZ2VBY2hpZXZlbWVudHMiLCJWaWV3UmV3YXJkVHlwZSIsIk1hbmFnZU1lbWJlcnMiLCJWaWV3QWNoaWV2ZW1lbnQiLCJWaWV3UmV3YXJkcyIsIlZpZXdBY2NvdW50U2V0dGluZ3MiLCJBZG1pblJld2FyZHMiLCJNYW5hZ2VDb250ZXN0IiwiVmlld0FjdGlvbnMiLCJBZG1pbk9iamVjdHMiLCJNYW5hZ2VPYmplY3RzIiwiVmlld01lbWJlcnMiLCJBZG1pbkV2ZW50cyIsIlZpZXdFdmVudHMiLCJBZG1pbk1lbWJlcnMiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIiwic2lkIjoiODcyNGI1NDAtZGE5NC00ZjhjLWIwYWYtNzRlNDYxNzUxNTk5IiwiYWNjb3VudF9pZCI6IkY3bThkSHdCc3ctT0gzTUVvVzIzIiwic3BhY2VfbmFtZSI6ImZpcnN0LXNwYWNlIiwibmFtZSI6IlppcW5pIFRlc3QgQWNjb3VudCIsInByZWZlcnJlZF91c2VybmFtZSI6InpxLXRlc3QtYWNjLTFAemlxbmkuY29tIiwibG9jYWxlIjoiZW4iLCJnaXZlbl9uYW1lIjoiWmlxbmkiLCJmYW1pbHlfbmFtZSI6IlRlc3QgQWNjb3VudCJ9.r1uJxSqJ9HYnYOdJ6hUo3KzocTwWTCJZTdXQndDn1gxHM9ckVtCr6FVfmfifhf6V191J-5eNVpK5ftWTKv84upcPcOEjsVm26jGTtagsX4gxY5_ozjatcXdRHkWFuXL_dhp4S0Y626tZQX1yXcqp9_IBseoAFUUoR98bcnKVwVo9ofDDIZxhAmm6JJ5BiDbiVGygqsVvVNO0JZh061G6RjyRNq8Hrt6Tzu5AyFeL5WuMjP0CQCs2JcdZdqOtUrAolInl1J9HzMNRMJZwdbhfH73BEojKAJv0WvsBQFu1FgyfVdM8oSH844rHl3Ed3ovoXBsmEv6WZHElcW0vUt977g';

let post_data_token = '';

const getToken = async (username, password, clientId) => {
  try {
    const { data } = await axios({
      method: 'POST',
      url: 'https://identity.ziqni.com/realms/ziqni/protocol/openid-connect/token',
      data: {
        client_id: clientId,
        username,
        password,
        grant_type: 'password',
      },
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
    })
    console.log('DATA => ', data);
    const { access_token, refresh_token } = data

    post_data_token = access_token;
  } catch (err) {
    console.log('GET ERROR =>', err.response);
  }
};


getToken(username, password, `${SPACE}.ziqni.app`);
// const post_data_token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJIdkdPZHNISUhLY2NNak1JRkVsZjdHTEMwUmswUHRYN1NlcV9zbW9CVUdJIn0.eyJleHAiOjE2ODE4MjQ5NTEsImlhdCI6MTY4MTgyNDY1MSwianRpIjoiMDA3YTg2OTItZjk0ZS00NThiLWEzOGYtNTc1ZGM4ZWZhYWVmIiwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS56aXFuaS5jb20vcmVhbG1zL3ppcW5pIiwic3ViIjoiMmUwYzdiMjgtMTFiNi00NzA1LWE2NGEtZDA2ODkzNTMxMWQ0IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiZmlyc3Qtc3BhY2UuemlxbmkuYXBwIiwic2Vzc2lvbl9zdGF0ZSI6IjNmY2E4ODc4LTkzYTItNGUyNC05MWFkLWViZjI1OWM1MDlkNiIsInJlc291cmNlX2FjY2VzcyI6eyJ6aXFuaS1hYXBpIjp7InJvbGVzIjpbIlZpZXdTcGFjZXMiLCJWaWV3Q29udGVzdCIsIk93bmVyIiwiTWFuYWdlTWVzc2FnZXMiLCJWaWV3UHJvZHVjdHMiLCJBZG1pbk1lc3NhZ2VzIiwiVmlld1VPTSIsIlZpZXdSdWxlcyIsIlN1cGVyQWRtaW4iLCJWaWV3Q3VzdG9tRmllbGRzIiwiVmlld0NvbXBldGl0aW9ucyIsIkFkbWluVXNlciIsIk1hbmFnZVJld2FyZHMiLCJWaWV3VGFncyIsIk1hbmFnZUNvbXBldGl0aW9uIiwiVmlld01lc3NhZ2VzIiwiTWFuYWdlRmlsZU9iamVjdFJlcCIsIk1hbmFnZVByb2R1Y3RzIiwiVmlld0F3YXJkcyIsIlZpZXdPYmplY3RzIiwiQWRtaW5Qcm9kdWN0cyIsIk1hbmFnZUFjaGlldmVtZW50cyIsIlZpZXdSZXdhcmRUeXBlIiwiTWFuYWdlTWVtYmVycyIsIlZpZXdBY2hpZXZlbWVudCIsIlZpZXdSZXdhcmRzIiwiVmlld0FjY291bnRTZXR0aW5ncyIsIkFkbWluUmV3YXJkcyIsIk1hbmFnZUNvbnRlc3QiLCJWaWV3QWN0aW9ucyIsIkFkbWluT2JqZWN0cyIsIk1hbmFnZU9iamVjdHMiLCJWaWV3TWVtYmVycyIsIkFkbWluRXZlbnRzIiwiVmlld0V2ZW50cyIsIkFkbWluTWVtYmVycyJdfX0sInNjb3BlIjoicHJvZmlsZSIsInNpZCI6IjNmY2E4ODc4LTkzYTItNGUyNC05MWFkLWViZjI1OWM1MDlkNiIsImFjY291bnRfaWQiOiJGN204ZEh3QnN3LU9IM01Fb1cyMyIsInNwYWNlX25hbWUiOiJmaXJzdC1zcGFjZSIsIm5hbWUiOiJaaXFuaSBUZXN0IEFjY291bnQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ6cS10ZXN0LWFjYy0xQHppcW5pLmNvbSIsImxvY2FsZSI6ImVuIiwiZ2l2ZW5fbmFtZSI6IlppcW5pIiwiZmFtaWx5X25hbWUiOiJUZXN0IEFjY291bnQifQ.XjqxdvfPRg479Oec25K7ew-F0FgRam8oFP54YyCCmGA8ygXAodOC3-VL_bT7KzGpqVlqCmZnm0Ylv4TWg22MffLOF3fKbQT773TYOa6hzDXkhYelFRAhd4ccJoJVAxNL1mWeQajbpx0NIjI51_gPLY1ierHSqIkMw-CqhHYyQph_D7NwwK6MrM2OZ7br6v-6OriDcjjgpihefSG2xygcL7cUesEgU7hMqJ_zZo4srcxHw8hHtqq8BTQ90FxjqJRDIhvaGek-_msBkwK9IFmVQYCr2GNC8L0rN_5POhdDCSwOowmV-rSxQvpkExZZ1nSOGHvNCQQH7uFeQEvRkFV-5w';
console.log('post_data_token => ', post_data_token);
const axiosGetDataInstance = axios.create({
  baseURL: `${GET_DATA_URL}/${get_data_space}`,
  timeout: 1000,
  headers: {
    'X-API-KEY': get_data_api_key,
    'Content-Type': 'application/json',
  },
});

const axiosPostDataInstance = axios.create({
  baseURL: `${POST_DATA_URL}`,
  headers: {
    Authorization: `Bearer ${post_data_token}`,
    'Content-Type': 'application/json',
  },
});

module.exports = { axiosGetDataInstance, axiosPostDataInstance, post_data_token };
