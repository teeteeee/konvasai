import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { createClient } from "@supabase/supabase-js";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader, JSONLinesLoader, } from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAI } from "langchain/llms/openai";


const privateKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqbXdjcHB2eWpscXd6Y3llZmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTEwMjI1NDksImV4cCI6MjAwNjU5ODU0OX0.khGrMFFx1b9VuUCvkjqMlpd1YRJOwqZxprXlREBFse8";
if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);

const url = "https://cjmwcppvyjlqwzcyefaw.supabase.co";
if (!url) throw new Error(`Expected env var https://cjmwcppvyjlqwzcyefaw.supabase.co`);


export const getVectorStore  = async () => {
  const client = createClient(url, privateKey);

  const model = new OpenAI({
    openAIApiKey: "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",
    temperature: 0,
  });
  
    const loader = new DirectoryLoader("./documents",
    {
    ".json": (path) => new JSONLoader(path, "/texts"),
    ".jsonl": (path) => new JSONLinesLoader(path, "/html"),
    ".txt": (path) => new TextLoader(path),
    ".csv": (path) => new CSVLoader(path, "text"),
    }
    );

    const docs = await loader.load();

  const vectorStore = await SupabaseVectorStore.fromTexts(
    docs,
    model,
    new OpenAIEmbeddings(model),
    {
      client,
      tableName: "documents",
      queryName: "match_documents",
    }
  );

  return vectorStore;
};