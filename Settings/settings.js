require('dotenv').config()

const getApiResponse = async (params) => {
    return options = {
        method: params.method,
        url: 'https://'+process.env.RAPIDAPI_HOST+'/'+params.endPoint,
        headers: {
          'x-rapidapi-host': process.env.RAPIDAPI_HOST,
          'x-rapidapi-key': process.env.RAPIDAPI_KEY
        }
    };
}

module.exports = {
    getApiResponse: getApiResponse  
}
