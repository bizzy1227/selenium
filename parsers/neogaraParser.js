// import { NEOGARA_AUTH_TOKEN, NEOGARA_CRM_URL } from '../consts.js'
const axios = require('axios');
const NEOGARA_AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJhZG1pbiIsInJvbGUiOiJtYW5hZ2VyIiwiaWF0IjoxNjEwOTg0OTYwfQ.Na4iOTVtX54dxGmKNmvpD4g_Z95-aJW8Nf7FPzOJwYE';
const NEOGARA_CRM_URL = 'https://dev.admin.neogara.com/';

const request = axios.create({
  baseURL: NEOGARA_CRM_URL,
  headers: {
    "accept": "application/json",
    "authorization": `Bearer ${NEOGARA_AUTH_TOKEN}`,
  }
})

const NeogaraGetConversions = async (options ={}) =>{
  try {
    const limit = parseInt(options.limit) || 10
    const data = await request.get(`conversions?limit=${limit}&page=1&sort%5B0%5D=id%2CDESC&offset=0`).then(res => {return res.data.data})
    return data.map(l => {return l.lid.email})
  } catch (error) {
    return error
  }
}

module.exports.NeogaraGetConversions = NeogaraGetConversions;

// (async ()=>{
//   console.log(await NeogaraGetConversions({limit: 5}));
// })()
