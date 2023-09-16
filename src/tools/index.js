import { DynamicTool } from 'langchain/tools';
import { getProductsDetails } from './functions/konvas.js';
console.log('hereetool');
export const getProductInfo = new DynamicTool({
  name: 'Get the product info',
  description: `call this to get information about products that are in paadai, 
      The input to this tool is called question which contains products infomation and the the output will be response gotten from pinecone that match the query.
      `,  
  func: (question) => getProductsDetails(question),
});
