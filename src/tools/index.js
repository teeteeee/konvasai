import { DynamicTool } from 'langchain/tools';
import { getProductsDetails } from './functions/konvas.js';


export const getProductInfo = new DynamicTool({
  name: 'Get the product info',
  description: `call this to get information about products that are in konvas ai, 
     `,  
  func: (question) => getProductsDetails(question),
});

// export const konvasQATool = async () => {
//     const vectorStore = await getVectorStore();
//     const chain = VectorDBQAChain.fromLLM(model, vectorStore);
//     return new ChainTool({
//       name: 'konvas-information-qa',
//       description:
//         'konvas information QA - useful for getting any information about konvas, products, paddai, kyc, e.t.c',
//       chain: chain,
//     });
//   };

// const model = new ChatOpenAI({
//     openAIApiKey: "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",
//     temperature: 0,
//   });

//   const openAIApiKey =("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");
//   console.log(openAIApiKey);
    

//     const loader = new DirectoryLoader("./documents",
//   {
//     ".json": (path) => new JSONLoader(path, "/texts"),
//     ".jsonl": (path) => new JSONLinesLoader(path, "/html"),
//     ".txt": (path) => new TextLoader(path),
//     ".csv": (path) => new CSVLoader(path, "text"),
//   }
//   );
//   const docs = await loader.load();
  

//   const vectorStore = await getVectorStore(docs, new OpenAIEmbeddings(model));
  
  
//   const vectorStore = await getVectorStore(docs, new OpenAIEmbeddings("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"));
//   const chain = VectorDBQAChain.fromLLM(model , vectorStore);

//   export const konvasQATool =  new ChainTool({ 
//         name: 'Get the product info',
//         description: `call this to get useful information about the products that is in konvas
//         there is an array of product data from json reponse, each element in the array form the json response represents a specific customer data`,
//         chain: chain,
//       });