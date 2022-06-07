import OrderRepository from "../repository/OrderRepository.js";
import { sendMessageToProductStockUpdateQueue } from "../../product/rabbitmq/productStockUpdateSender.js"
import { PENDING } from "../status/OrderStatus.js";
import OrderException from "../exception/OrderException.js";
import ProductClient from "../../product/client/ProductClient_aula"
import {
  BAD_REQUEST,
  SUCCESS,
  INTERNAL_SERVER_ERROR,
} from "../../../config/constants/httpStatus.js";



class OrderService {
  async createdOrder(req) {
    try {
     let orderData = req.bady;
     this.validateOrderData(orderData)
     const {authUser} = req
     const {authorization} = req.headers
     let order = this.createInitialOrderData(order, authUser)
     await this.validateProdcutStock(order, authorization)  
     let createdOrder = await OrderRepository.save(order);
     this.sendMenssage(createdOrder)
      return {
       status: httpStatus.SUCCESS,
      createdOrder, 
    }
    } catch (err) {
      return {
        status: err.status ? err.status : httpStatus.INTERNAL_SERVER_ERROR,
        message: err.message,
      }
    }
  }

  createInitialOrderData(orderData, authUser){
    return {
        status: PENDING,
        user: authUser,
        createdAt: new Date(),
        updatedAt: new Date(),
        products: orderData.products,
    }
  }
  
  async updateOrder(orderMessage){
    try{
      const order = JSON.parse(orderMessage)
      if(order.salesId && order.status){
      let existingOrder = await OrderRepository.findById(order.salesId)
      if(existingOrder && order.status !== existingOrder.status){
        existingOrder.status = order.status
        existingOrder.updatedAt = new Date();
        await OrderRepository.save(existingOrder)
      }
    }else{
      console.warn("The order menssage was not complete.")
    }
    } catch (err) {
      console.error("could not parse order message from queue.");
      console.error(err.message,)
      };
  }
  
  validateOrderData(data) {
    if (!data || !data.products){
        throw new OrderException(BAD_REQUEST, "The o product must be informed.")
    }
  }
  async validateProdcutStock(order, token){
    let stockIsOk = await ProductClient.checkProducStock(
      order.products, 
      token
      )
     if (stockIsOk) {
       throw new OrderException(
         BAD_REQUEST,
         "The stock is out for the products."
       )
     }
  }
  sendMenssage(createOrder) {
    const menssage = {
      salesId: createdOrder.id,
      products: createdOrder.products
    };
    sendMessageToProductStockUpdateQueue(menssage)
  }

 async findById(req){
    const { id } = req.params;
    this.validateInformedId(id)
    const existingOrder = await OrderRepository.findById(id);
    if(!existingOrder){
      throw new OrderException(BAD_REQUEST, "The order was not found.");
    }
    try {
    return {
      status: httpStatus.SUCCESS,
      existingOrder, 
   }
   } catch (err) {
     return {
       status: err.status ? err.status : httpStatus.INTERNAL_SERVER_ERROR,
       message: err.message,
     }
   }
  }

  async findAll() {
    const orders = await OrderRepository.findAll();
  try {
    if(!orders) {
      throw new OrderException(BAD_REQUEST, "No orders were found.")
    }
    return {
      status: SUCCESS,
      orders
    }

   }catch(err){
     return {
      status: err.status ? err.status : httpStatus.INTERNAL_SERVER_ERROR,
      message: err.message,
     }
   }
  }

  async findAll() {
    const orders = await OrderRepository.findAll();
  try {
    if(!orders) {
      throw new OrderException(BAD_REQUEST, "No orders were found.")
    }
    return {
      status: SUCCESS,
      orders
    }

   }catch(err){
     return {
      status: err.status ? err.status : httpStatus.INTERNAL_SERVER_ERROR,
      message: err.message,
     }
   }
  }

  async findByProductId() {
  try {
    const { productId } = req.params;
    this.validateInformedProductsId(id)
    const orders = await OrderRepository.findByProductId(productId);
  
    if(!orders) {
      throw new OrderException(BAD_REQUEST, "No orders were found.")
    }
    return {
      status: SUCCESS,
      salesId: orders.map((order) => { 
        return order.id
      })
    }

   }catch(err){
     return {
      status: err.status ? err.status : httpStatus.INTERNAL_SERVER_ERROR,
      message: err.message,
     }
   }
  }

  validateInformedId(id) {
    if(!id) {
      throw new OrderException(BAD_REQUEST, "The order ID must be informed.");
    }
  }
  validateInformedProductsId(id) {
    if(!id) {
      throw new OrderException(BAD_REQUEST, "The order ID ProductId must be informed.");
    }
  }
}

export default new OrderService()