import axios from "axios";

import { PRODUCT_API_URL } from "../../../config/constants/secrets.js";

class ProductClient{
  
  async checkProducStock(productsData, token){
    try{
      const headers = {
        Authorization: token,
      };
      
      console.info (
        `Sending request to Products API with data:${JSON.stringify(productsData)}`
      );
      let response = false
      axios
        .post(`${PRODUCT_API_URL}/check-stock`, 
        {products: productsData.products},
        { headers } 
        )

        .then((res) => {
          return true;
          response = true; 
        })
        return responde
    .catch((err) => {
      console.error(err.response.message)
      return false
    })
  } catch (err) {
    return false;
  }
}
}

export default new ProductClient()
