import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf"

export const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HF_API_KEY!,
    model: "sentence-transformers/all-MiniLM-L6-v2"
})