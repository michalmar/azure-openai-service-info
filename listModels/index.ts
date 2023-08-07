import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios from 'axios';


function getCurrentDateAsString(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<any> {
    context.log('HTTP trigger function processed a request.');
    
    // const name = (req.query.name || (req.body && req.body.name));
    // const responseMessage = name
    //     ? "Hello, " + name + ". This HTTP triggered function executed successfully."
    //     : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: process.env.OPENAI_API_URL,
        headers: { 
          'Content-Type': 'application/json', 
          'api-key': process.env.OPENAI_API_KEY
        },
      //   data : data
      };

      let responseMessage;
      
      await axios.request(config)
      .then((response) => {
        console.log("response recieved");
        responseMessage = response.data.data

      })
      .catch((error) => {
        console.log(error);
      });

    context.bindings.outputDocument = JSON.stringify([
        {
            "id": getCurrentDateAsString(),
            "data": responseMessage
        }]);;
    
    return {
        res: {
            body: "done"
        }
    };

};

export default httpTrigger;