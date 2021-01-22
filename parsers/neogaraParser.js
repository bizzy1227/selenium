// import { NEOGARA_AUTH_TOKEN, NEOGARA_CRM_URL } from '../consts.js'
const axios = require('axios');
const NEOGARA_AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwibG9naW4iOiJqb2UiLCJyb2xlIjoibWFuYWdlciIsImlhdCI6MTU5NzkyNzE1M30.WO-gSJ-oD3ob5ie4SvlOy3Zmx87rxfgPLRWXaFilWbg';
const NEOGARA_CRM_URL =  'https://admin.neogara.com/';

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
    return data.map(l => {return {email: l.lid.email, device: l.lid.userAgent, ref: l.lid.ref}})
  } catch (error) {
    return error
  }
}

module.exports.NeogaraGetConversions = NeogaraGetConversions;

// (async ()=>{
//   console.log(await NeogaraGetConversions({limit: 5}));
// })()
