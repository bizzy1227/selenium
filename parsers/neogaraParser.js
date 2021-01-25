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

const NeogaraGetConversions = async (startDate) =>{
  try {

    startDate = await encodeURIComponent(startDate);
    console.log(startDate);
    // finishDate = encodeURIComponent(finishDate);

    // console.log(`?filter=%7B"createdAt%7C%7C%24gte"%3A"${startDate}"%2C"createdAt%7C%7C%24lte"%3A"${finishDate}"%7D&order=DESC&page=1&perPage=25&sort=id`);
    

    // const limit = parseInt(options.limit) || 10
    const data = await request.get(`conversions?filter%5B0%5D=createdAt%7C%7C%24gte%7C%7C${startDate}&filter%5B1%5D=lid.providerId%7C%7C%24in%7C%7C122&limit=10&page=1&sort%5B0%5D=id%2CDESC&offset=0`).then(res => {return res.data.data})
    return data.map(l => {return {email: l.lid.email, device: l.lid.userAgent, ref: l.lid.ref, createdAt: l.lid.createdAt}})
  } catch (error) {
    return error
  }
}

// const NeogaraGetConversions = async (options ={}) =>{
//   try {
//     const limit = parseInt(options.limit) || 10
//     const data = await request.get(`conversions?limit=${limit}&page=1&sort%5B0%5D=id%2CDESC&offset=0`).then(res => {return res.data.data})
//     return data.map(l => {return {email: l.lid.email, device: l.lid.userAgent, ref: l.lid.ref}})
//   } catch (error) {
//     return error
//   }
// }

module.exports.NeogaraGetConversions = NeogaraGetConversions;

// (async ()=>{
//   console.log(await NeogaraGetConversions('2021-01-25T08:14:50.410Z'));
// })()
