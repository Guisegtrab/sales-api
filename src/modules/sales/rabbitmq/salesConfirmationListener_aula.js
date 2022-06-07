import amqp from "amqplib/callback_api.js";
import { RABBIT_MQ_URL } from "../../../config/constants/secrets.js";
import { SALES_CONFIRMATION_QUEUE } from "../../../config/rabbitmq/queue.js";
import OrderService from "../service/OrderService_aula";

export function listenToSalesConfirmationQueue(){
  amqp.connect(RABBIT_MQ_URL, (error, connection) => {
    if (error) {
      throw error;
    }
    console.info("Listening to Sales Confirmation Queue... RabbitMQ...");
    connection.createChannel((error, channel) => {
      if (error) {
        throw error;
      }
      channel.consume(SALES_CONFIRMATION_QUEUE, (menssage) => {
        cosole.info(
          `Recieving message from queue: ${menssage.content.toString()}`
        );
        OrderService.updateOrder(menssage) 
      },
      {
        noAck: true,
      }
    );
    })
  });
}
