import axios from "axios"

const url = ""

const api = axios.create({
    baseUrl: url
})

api.request.interceptors.use((config)=>{
  
})