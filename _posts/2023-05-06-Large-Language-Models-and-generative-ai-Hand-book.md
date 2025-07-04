<script type="text/javascript" async
  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML">
</script>

A large language model (LLM) is a type of machine learning model that can do a lot of cool things with language. It can write text that sounds like it was written by a human, answer questions like a human would, and even translate text from one language to another. LLMs are trained using a lot of data and deep learning algorithms to understand language better. 😎

## Transformer Architecture

- **What is the transformer architecture?** - The transformer architecture is a deep neural network architecture that was introduced in the paper "Attention Is All You Need" by Vaswani et al..
- **How does the transformer architecture work?** - The transformer architecture uses self-attention to compute representations of input sequences.
- **What are some applications of the transformer architecture?** - The transformer architecture has been used for a wide range of applications, including machine translation, text classification, and text generation.

## Transformer and NN Basics 
- GPT 2 implementation from scratch by Andrej Karpathy. [Video](https://youtu.be/l8pRSuU81PU?si=UoCg7doBKkuswf68)

- GPT (Generative pretrained-transformer) created by Andrej Karpathy for education purpose. [Video](https://www.youtube.com/watch?v=kCc8FmEb1nY)
  
- [llama3 from scratch](https://github.com/naklecha/llama3-from-scratch)

  
## Stages of building LLM

![gpt_stage](/images/rlhf/gpt-stages.png)
[Image courtesy](https://www.youtube.com/watch?v=bZQun8Y4L2A&pp=ygUPYW5kcmVqIGthcnBhdGh5)

LLM starts with the pre-training stage where the model learns to predict next token given it is an auto-regressive language model. Pre-training is done an internet-scale dataset. 

#### Scaling law
Scaling law helps to identify relationship among model parameters, dataset size and compute budget. There is a powerlaw relationship, meaning two quantities are proportional to each other based on power raised to a constant:
- Testloss vs compute budget
- Testloss vs dataset size (number of tokens)
- Testloss vs number of model parameters

Refer to [Chinchilla scaling law: Training Compute-Optimal Large Language Models](https://openreview.net/pdf?id=iBBcRUlOAPR)


Following scaling law was followed during pretraining BloombertGPT.
![bgpt_scaling_polity](/images/rlhf/scaling-bgpt.png)

## Reasoning language model

- [DeepSeek R1 guide](https://newsletter.languagemodels.co/p/the-illustrated-deepseek-r1)
- [DeepSeek bits and bytes](https://stratechery.com/2025/deepseek-faq/)

## Prompt optimization for LLM application layer
### [TextGrad](https://arxiv.org/abs/2406.07496)

![textgrad](/images/llm/textgrad.png)

TextGrad offers a PyTorch-style API designed for automatic text based optimization. It allows automatically transform a simple prompt to classify data in a more sophisticated prompt that is suitable for application. TextGrad does this by backpropagating text feedback from the output of a language models to all the possible earlier components in the pipeline for optimization.TextGrad uses language models to 1) evaluate outputs, 2) criticize them and 3) update the inputs. 

### [Recursively criticizes and improves](https://arxiv.org/abs/2303.17491)
### [Metaprompt](https://platform.openai.com/docs/guides/prompt-generation?context=text-out)
### [DSPy](https://github.com/stanfordnlp/dspy)

### Anthropic’s Prompt Engineering Interactive Tutorial
The Google Sheets-based interactive exercises to experiment with different [prompts](https://lnkd.in/gqr5uQqg)

## AI agents
- [Multi-agent system blog](https://monirzaman.github.io/Exploring-the-Dynamics-of-LLM-based-Agent-Frameworks/)
- [Multi-agent system course](https://llmagents-learning.org/f24)
  

## LLM Finetuning 

### OpenAI’s best practices for finetuning
[This guide](https://lnkd.in/g7_kspz4) focuses on GPT-3, but are applicable to full finetuning in general. It includes how finetuning works, how to prepare training data, etc.

![llamafactory](/images/rlhf/IMG_3742.jpeg)

[LlamaFactory](https://arxiv.org/pdf/2403.13372.pdf) provides a unified and efficient fine-tuning framework for a wide range of large language models (LLMs). By integrating various efficient training methods and supporting over 100 LLMs, LlamaFactory allows users to easily adapt these models to different downstream tasks.

## Supervised Fine-Tuning

- **What is fine-tuning?** - Fine-tuning is the process of adapting a pre-trained language model to a specific task or domain.
- **How does fine-tuning work?** - Fine-tuning involves training the pre-trained language model on a small amount of task-specific data.
- **What are some applications of fine-tuning?** - Fine-tuning can be used for a wide range of applications, including sentiment analysis, named entity recognition, and text classification.


**Fine-tuning examples:**

- [Finetune Mistral7B with QLoRA](https://youtu.be/XpoKB3usmKc?si=0saivyYISTL8wic0)

- [Finetune LLM with multiple LoRA adapter](https://kaitchup.substack.com/p/combine-multiple-lora-adapters-for)
  
- Finetune coding assistant [slides](https://docs.google.com/presentation/d/17gYjRsfNYoG4oyQMx23goHI1viyh15Gdwij-D3ZGNOs/mobilepresent?slide=id.p) [colab](https://colab.research.google.com/drive/1GCU8XbdHO1kb72bj4dUvmAuClY9cpSyU?usp=sharing)

- [Finetune Gemma with PEFT](https://huggingface.co/blog/gemma-peft)

- [Train multimodal LLM Yi](https://github.com/MonirZaman/MonirZaman.github.io/blob/master/_posts/Training-multimoda-language-model-Yi.md)
  
- [Finetune llama2 with HF on sagemaker](https://www.philschmid.de/sagemaker-llama2-qlora)
  
- [Fine-tuning recipe with Parameter efficient finetuning LoRA and evaluation](https://github.com/MonirZaman/MonirZaman.github.io/blob/master/_posts/generative-ai-with-llm/Lab_2_fine_tune_generative_ai_model.md)

- [Interactively fine-tune Falcon-40B and other LLMs on Amazon SageMaker Studio notebooks using QLoRA](https://aws.amazon.com/blogs/machine-learning/interactively-fine-tune-falcon-40b-and-other-llms-on-amazon-sagemaker-studio-notebooks-using-qlora/)

## RLHF: Reinforcement Learning from Human Feedback
 - [Youtube lecture by Hyung from OpenAI](https://youtu.be/zjrM-MW-0y0) [Slides](https://docs.google.com/presentation/d/13Tylt2SvKvBL2hgILy5CmBtPDv3rXlVrQp01OzAe5Xo/edit#slide=id.g238b2698243_0_791)
 - [Blog by Chip](https://huyenchip.com/2023/05/02/rlhf.html)
 - Reading notes on RLHF

**Reward model (RM)**: RM is used to model human feedback. Reward model is also a language model except for the last layear is the linear layer that outputs a reward value. Given two completion $$y_{i}$$ and $$y_{j}$$, objective to model the probability $$p_{ij}$$ which denotes the confidence for $$y_{i}$$ is better than $$y_{j}$$:

![reward](/images/rlhf/reward.png)
  
**Proximal policy optimization (PPO)**: Next, we apply reinforcement learning that trains a policy aka language model parameters to generate text with higher reward based on the reward model. It samples many prompts and uses the language model to generate sequence for these prompts. Objective is to maximize the expected reward i.e., weighted summation of completion rewards with weights as the probability of the completion.

<img src="/images/rlhf/objective.png" width="500" height="100" style="display:block;margin:auto;">

<img src="/images/rlhf/gradientascend.png" width="400" height="100" style="display:block;margin:auto;">

Proximal policy optimization (PPO) is used to compute the gradient. Iterative algorithm like gradient ascend is used to solve the optimization objective. 

Steps of policy gradient training steps:
- Initialize parameters of the language model from Supervised finetuned mode
- Samples prompt from dataset, generates sequence for the prompts and current policy 
- Calculate reward for the prompt and completion
- Calculate gradients and update the parameters of the language model

**Regularization**
Vanilla policy gradient can over optimize to the Reward model. A per-token KL divergence from SFT distribution penalty added as a regularization. This is to keep some of the variation from SFT model.

![reward](/images/rlhf/reg.png)

## Mixture of expert
- [Mixtral blog](https://octo.ai/blog/what-is-a-mixtral-of-experts/)

## Langchain handbooks
- LangChain for LLM Application Development \| [DeepLearning.ai](https://www.deeplearning.ai/short-courses/building-systems-with-chatgpt/) \| [Student copy](https://github.com/MonirZaman/MonirZaman.github.io/blob/master/_posts/LangChain-for-LLM-Application-Development/)
- LangChain: Chat with Your Data \| [DeepLearning.ai](https://www.deeplearning.ai/short-courses/langchain-chat-with-your-data/) \| [Student copy](https://github.com/MonirZaman/MonirZaman.github.io/blob/master/_posts/LangChain-Chat-with-Your-Data/)
- [LangChain handbook](https://www.pinecone.io/learn/series/langchain/)

## Retrieval augmented generation (RAG)
![rag-survey](https://pbs.twimg.com/media/GIACqFfWQAMR7Wb?format=jpg&name=large)

- [Late chunking application in RAG](https://huggingface.co/blog/manu/conteb)
- [Corrective and self reflection RAG in langchain](https://youtu.be/E2shqsYwxck?si=ilq_iAc61pje2EC4)
- [Adaptive RAG with mistral and llamaindex](https://github.com/mistralai/cookbook/blob/main/third_party/LlamaIndex/Adaptive_RAG.ipynb)
- [Q/A with youtube transcription in langchain and pinecone](https://m.youtube.com/watch?v=BrsocJb-fAo)

- [Financial query Mixtral model](https://github.com/AkimParis/Mixtral_RAG/blob/main/RAG_Mixtral_Europe_Fin_Data.ipynb)

## Online course
- [MIT 2023 Efficient ML](https://www.youtube.com/playlist?list=PL80kAHvQbh-pT4lCkDT53zT8DKmhE0idB)
  
- [NYU 2023 spring course on Natural Language Processing](https://nyu-cs2590.github.io/spring2023/calendar/)
- Building Systems with the ChatGPT API \| [DeepLearning.ai](https://www.deeplearning.ai/short-courses/building-systems-with-chatgpt/) \| [Student copy](https://github.com/MonirZaman/MonirZaman.github.io/blob/master/_posts/Building-Systems-with-the-ChatGPT-API/LLM.md)
- [Full stack's course on LLM](https://fullstackdeeplearning.com/llm-bootcamp/spring-2023/)

## Evaluation of LLM
- [Holistic evaluation of language model HELM](https://youtu.be/HJGccJh07Os)

## Knowledge representation and Hallucination
- Hallucination refers to mistakes in the generated text that are statistically plausible but are in fact incorrect or nonsensical
- [Stanford lecture](https://www.youtube.com/watch?v=4ynrGLIuPv4)

## Additional case study
- [Paper2podcast](https://github.com/Azzedde/paper_to_podcast/blob/main/paper_to_podcast.py)
- [flyte q/a bot with langchain, faiss, gpt](https://flyte.org/blog/building-flytegpt-on-flyte-with-langchain)

## Interview resource
- [Mastering LLM questions](https://github.com/llmgenai/LLMInterviewQuestions/tree/main)
- Topics covered typically (Courtesy [Rohit Shah](https://www.linkedin.com/in/rohit-shah-00579175?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app)).


  
## Select technical concepts related to LLM and Transformer

**Byte Pair Encoding (BPE)** 
Byte Pair Encoding (BPE) and SentencePiece are both subword tokenization methods that are used in NLP. BPE is a data-driven method that iteratively replaces the most frequent pair of bytes in a sequence with a single, unused byte. Subword tokenization with BPE helps in effectively tackling the concerns of out-of-vocabulary words. SentencePiece is an unsupervised text tokenizer and detokenizer mainly for Neural Network-based text generation systems where the vocabulary size is predetermined prior to the neural model training

**Positional embedding**
Positional embeddings are added to the word embeddings once before the first layer. Each position t within the sequence gets different embedding when t is even then use sine function if t is odd then consine function.
- [Referrence](https://towardsdatascience.com/understanding-positional-encoding-in-transformers-dc6bafc021ab)

## Dataset generation
- [cosmopedia](https://huggingface.co/blog/cosmopedia)
