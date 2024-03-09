# Yi: A Large-Scale Language Model with Multimodal and Multilingual Capabilities
This paper introduces Yi, a 34-billion-parameter language model that can handle multimodal and multilingual tasks. Yi is trained on a diverse and high-quality dataset of web documents, images, and dialogues, and can generate coherent and informative responses in various domains and languages.

## Dataset Pipeline
The dataset pipeline consists of the following steps:
- Web Crawling: Collect web documents from Common Crawl and use the CCNet pipeline to filter them by language and perplexity.
- Heuristic Filtering: Remove low-quality text based on heuristic rules such as URL, domain, word blocklists, garbled text, document length, special symbol ratio, short/consecutive/incomplete lines, and repeated words/n-grams/paragraphs.
- Learned Filtering: Use learned models such as perplexity scorer (KenLM), quality scorer (Wikipedia classifier), safety scorer, and document coherence scorer to further identify and remove low-quality content.
- Clustering: Group and analyze documents by similarity and remove low-quality ones.
- Deduplication: Eliminate duplicate or near-duplicate documents using document-level MinHash deduplication and sub-document exact-match deduplication.
- Topic Modeling: Assign web documents to specific themes using a topic model and down-sample less helpful content in the final pretraining dataset, such as advertisement.

## Model Pre-training, Fine-tuning, Multimodality and Model Merging
The model pre-training, fine-tuning, multimodality and model merging are as follows:
- Pre-training: Start from the Llama 2 architecture with Grouped-Query Attention (GQA), SwiGLU activation, and RoPE. Train on the 3.1T pretraining corpora on 4k context with 65,000 vocabulary. Continue pre-training on 10B tokens with up-sampled long sequences (5B) from books.
- Fine-tuning: Create a small (< 10K) dataset of multi-turn instruction-response dialog pairs, using techniques such as CoT, Evol-Instruct, and diversity-filtering. Supervise Fine-tune the Base model using ChatML format for ~2 epochs.
- Multimodality: Follow a similar approach to Llava by adding a vision encoder (CLIP) to the chat model connected with an MLP. Train the vision encoder and connector on 100M 224x224 image-text pairs. Then scale the resolution by continuing training on ~25M 448x448 pairs. Train the entire VLLM (Vision Encoder + LLM) on ~1M samples, achieving a MMMU score of 41.6 (GPT-4V 55.7).
- Merging: Yi-9B is an upscale of Yi-6B by merging/duplicating the original 16 middle layers and continuing pre-training on 800B tokens (more code), leading to +5% on MMLU and +23% on HumanEval.

## Insights
Some of the insights from the paper are:
- A small (<10K) dataset is sufficient for fine-tuning, compared to OpenHermes which has 1M samples.
- 5B length-upsampled data is effective for extending the context.
- 6B model can fit on edge devices and 34B model can fit on 1x A100 GPU.
- SFT responses have a clear introduction-body-conclusion structure.
- There is no information on data contamination as part of the data pipeline.
- 34B Yi model can compete with Llama 2 70B model.
- Merging is a potential way to adapt to new domains/skills.

## Link
Arxiv: https://lnkd.in/eNiM5SGG
Github: https://lnkd.in/esXbu-_g
Model: https://lnkd.in/eFBGRdr2
