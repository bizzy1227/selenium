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

// const NeogaraGetConversions = async (options ={}) =>{
//   try {

//     // startDate = encodeURIComponent(startDate);
//     // finishDate = encodeURIComponent(finishDate);

//     // console.log(`?filter=%7B"createdAt%7C%7C%24gte"%3A"${startDate}"%2C"createdAt%7C%7C%24lte"%3A"${finishDate}"%7D&order=DESC&page=1&perPage=25&sort=id`);
    

//     const limit = parseInt(options.limit) || 10
//     const data = await request.get(`conversions?filter=%7B"createdAt%7C%7C%24gte"%3A"2021-01-20T11%3A36%3A00.000Z"%2C"createdAt%7C%7C%24lte"%3A"2021-01-21T11%3A36%3A00.000Z"%7D&order=DESC&page=1&perPage=25&sort=id`).then(res => {return res.data.data})
//     return data.map(l => {return {email: l.lid.email, device: l.lid.userAgent, ref: l.lid.ref}})
//   } catch (error) {
//     return error
//   }
// }

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
//   console.log(await NeogaraGetConversions());
// })()
