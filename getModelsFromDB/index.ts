import { AzureFunction, Context, HttpRequest } from "@azure/functions"
// Get Cosmos Client
import { CosmosClient } from "@azure/cosmos";


// Uniqueness for database and container
const timeStamp = + new Date();

// Set Database name and container name with unique timestamp
const databaseName = `openai`;
const containerName = `openai`;
const partitionKeyPath = ["/id"]
// Authenticate to Azure Cosmos DB

//TODO: Add this to local.settings.json
const connstring = process.env.COSMOS_CONNSTRING;
// Provide required connection from environment variables
const key = process.env.COSMOS_KEY;
// Endpoint format: https://YOUR-RESOURCE-NAME.documents.azure.com:443/
const endpoint = process.env.COSMOS_ENDPOINT;

// const cosmosClient = new CosmosClient({ endpoint, key });
const cosmosClient = new CosmosClient(connstring);



const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    
    // get the id from query string
    const id = (req.query.id || (req.body && req.body.id));
   
    //get the container from db
    const { database } = await cosmosClient.databases.createIfNotExists({ id: databaseName });
    const { container } = await database.containers.createIfNotExists({
        id: containerName,
        partitionKey: { paths: partitionKeyPath }
    });

    // console.log(`Querying container: ${containerName}`);
    // console.log(`Querying container: ${container.id}`);

    // Read item by id and partitionKey - least expensive `find`
    const { resource } = await container.item(id, id).read();

    //check if resource has data
    if (!resource) {
        context.res = {
            status: 404,
            body: "Not Found"
        };
        return;
    }
    else {
        // we found the resource
        // console.log("resource found");
        console.log(`${resource.id} read`);

        context.res = {
            // status: 200, /* Defaults to 200 */
            // body: JSON.stringify(resource.data)
            body: resource.data
        };
        return;
    }
};


export default httpTrigger;