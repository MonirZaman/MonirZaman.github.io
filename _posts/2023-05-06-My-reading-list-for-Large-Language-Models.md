A large language model (LLM) is a type of machine learning model that can do a lot of cool things with language. It can write text that sounds like it was written by a human, answer questions like a human would, and even translate text from one language to another. LLMs are trained using a lot of data and deep learning algorithms to understand language better. 😎

## Transformer Architecture

- **What is the transformer architecture?** - The transformer architecture is a deep neural network architecture that was introduced in the paper "Attention Is All You Need" by Vaswani et al..
- **How does the transformer architecture work?** - The transformer architecture uses self-attention to compute representations of input sequences.
- **What are some applications of the transformer architecture?** - The transformer architecture has been used for a wide range of applications, including machine translation, text classification, and text generation.

## Fine-Tuning

- **What is fine-tuning?** - Fine-tuning is the process of adapting a pre-trained language model to a specific task or domain.
- **How does fine-tuning work?** - Fine-tuning involves training the pre-trained language model on a small amount of task-specific data.
- **What are some applications of fine-tuning?** - Fine-tuning can be used for a wide range of applications, including sentiment analysis, named entity recognition, and text classification.

## RLHF: Reinforcement Learning from Human Feedback
 - [Youtube lecture by Hyung from OpenAI](https://youtu.be/zjrM-MW-0y0) [Slides](https://docs.google.com/presentation/d/13Tylt2SvKvBL2hgILy5CmBtPDv3rXlVrQp01OzAe5Xo/edit#slide=id.g238b2698243_0_791)
 - [Blog by Chip](https://huyenchip.com/2023/05/02/rlhf.html)
 - Reading notes on RLHF

**Reward model (RM) **: RM is used to model human feedback. Reward model is also a language model except for the last layear is the linear layer that outputs a reward value. Given two completion <img src="https://render.githubusercontent.com/render/math?math=y_{i}"> and $$y_{j}$$, objective to model the probability $p_{ij}$ which denotes the confidence $y_{i}$ is better than $y_{j}$:
![reward](/images/rlhf/reward.png)
  
**Proximal policy optimization (PPO)**: Next, we apply reinforcement learning that trains a policy aka language model parameters to generate text with higher reward based on the reward model. It creates many prompts and uses the language model to generate sequence for these prompts. Objective is to maximize the expected reward i.e., weighted summation of completion rewards with weights as the probability of the completion.


![reward](/images/rlhf/objective.png)

![reward](/images/rlhf/gradientascend.png)

Proximal policy optimization (PPO) is used to compute the gradient. Iterative algorithm like gradient ascend is used to solve the optimization objective. 





## nanoGPT
Generative pretrained-transformer created by Andrej Karpathy for education purpose
 - [Video](https://www.youtube.com/watch?v=kCc8FmEb1nY)

## Evaluation of LLM
- [Holistic evaluation of language model HELM](https://youtu.be/HJGccJh07Os)


## Online course
- [NYU 2023 spring course on Natural Language Processing](https://nyu-cs2590.github.io/spring2023/calendar/)
- [Full stack's course on LLM](https://fullstackdeeplearning.com/llm-bootcamp/spring-2023/)


## Knowledge representation and Hallucination
- Hallucination refers to mistakes in the generated text that are statistically plausible but are in fact incorrect or nonsensical
- [Stanford lecture](https://www.youtube.com/watch?v=4ynrGLIuPv4)

## Application
- [flyte q/a bot with langchain, faiss, gpt](https://flyte.org/blog/building-flytegpt-on-flyte-with-langchain)


## Select technical concepts related to LLM and Transformer

**Byte Pair Encoding (BPE)** 
Byte Pair Encoding (BPE) and SentencePiece are both subword tokenization methods that are used in NLP. BPE is a data-driven method that iteratively replaces the most frequent pair of bytes in a sequence with a single, unused byte. Subword tokenization with BPE helps in effectively tackling the concerns of out-of-vocabulary words. SentencePiece is an unsupervised text tokenizer and detokenizer mainly for Neural Network-based text generation systems where the vocabulary size is predetermined prior to the neural model training

**Positional embedding**
Positional embeddings are added to the word embeddings once before the first layer. Each position t within the sequence gets different embedding if t = 2 i is even then use sine function if t is odd then consine function.
- [Referrence](https://towardsdatascience.com/understanding-positional-encoding-in-transformers-dc6bafc021ab)
