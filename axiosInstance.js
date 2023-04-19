const axios = require('axios');
require('dotenv').config();

const get_data_url = process.env.GET_DATA_URL;
const get_data_space = process.env.GET_DATA_SPACE;
const admin_api_key = process.env.GET_DATA_ADMIN_API_KEY;

const POST_DATA_URL = 'https://api.ziqni.com';
const clientId = `${process.env.POST_DATA_SPACE}.ziqni.app`;

const username = process.env.USER_NAME;
const password = process.env.PASSWORD;

const getToken = async () => {
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

    const { access_token } = data

    return axios.create({
      baseURL: `${POST_DATA_URL}`,
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.log('GET ERROR =>', err.response);
  }
};


const axiosGetDataInstance = axios.create({
  baseURL: `${get_data_url}/${get_data_space}`,
  timeout: 1000,
  headers: {
    'X-API-KEY': admin_api_key,
    'Content-Type': 'application/json',
  },
});


module.exports = { axiosGetDataInstance, getToken };