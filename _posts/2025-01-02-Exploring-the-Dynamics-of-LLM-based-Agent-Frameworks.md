In the ever-evolving landscape of artificial intelligence, LLM-based-agent frameworks stand at the forefront of innovation, driving systems that are more robust, adaptable, and intelligent. These frameworks represent a paradigm shift from solitary computational entities to a collective of agents, each with unique capabilities and roles, working in concert to solve complex problems. 

At its core, a framework is a system composed of multiple interacting intelligent agents. 

- Large Language Models (LLMs): These are the core of the agents’ intelligence, enabling them to understand and generate human language. They act as the reasoning engine for the agents, allowing them to process complex data and queries to produce coherent responses1.

- Agents: These are autonomous entities within the framework, each designed to perform specific tasks and make decisions. They work collaboratively towards a shared goal, using LLMs to facilitate advanced decision-making and task execution1.

- Tools: These are specialized functions or skills that agents use to carry out their tasks. They can range from simple data retrieval to more complex analytical functions, forming the operational backbone of the agents1.

- Processes or Flows: These define the orchestration of tasks within the system, ensuring that tasks are distributed efficiently and aligned with the framework’s objectives. They guide both the interactions between agents and the use of tools to achieve the desired outcomes

![agent-overview](/images/rlhf/agent.png)
*Agent system overview ([Source: lilianweng.github.io](https://lilianweng.github.io/posts/2023-06-23-agent/))*

## Resources on agent framework
- [LLM-based-agent system course link](https://llmagents-learning.org/f24)

- [Building effective agents](https://www.anthropic.com/research/building-effective-agents)

- [LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)

## Code examples
- [Finetuning for tool calling](https://huggingface.co/agents-course/notebooks/blob/main/bonus-unit1/bonus-unit1.ipynb)

## Agent framework Case Study

## AI-CO Scientist

![ai-coscientist](/images/rlhf/co-scientist.png)
*AI-Co Scientist ([Source: paper](https://storage.googleapis.com/coscientist_paper/ai_coscientist.pdf))*

The AI co-scientist multi-agent system processes a user’s research goal by converting it into a plan, which is then evaluated by the Supervisor agent. This agent allocates resources to specialized agents, queuing them as tasks. Worker agents execute these tasks, and the system consolidates results into a research overview with hypotheses for the scientist. The Supervisor agent coordinates the agents to create valid, innovative hypotheses. The Generation agent generates hypotheses, which are reviewed by the Reflection agent and evaluated by the Ranking agent. Other agents, such as Evolution and Meta-review, refine and improve the hypotheses.

The Supervisor agent tracks statistics on the hypotheses and reviews, optimizing future operations by adjusting agent weights. Feedback from the Meta-review agent enhances the agents’ performance without back-propagation methods, using the long-context capabilities of the Gemini 2.0 models to continuously improve the system through iterative learning and increased compute resources.

## AI CUDA Engineer

![ai-cuda](/images/rlhf/ai-cuda-engineer.png)
*AI-CUDA Engineer ([Source: blog](https://sakana.ai/ai-cuda-engineer/))*

AI CUDA engineer optimizes CUDA kernel in four stages for enhanced performance. In Stage 1 and 2, PyTorch code is translated into CUDA kernels, yielding initial runtime improvements. Stage 3 uses evolutionary optimization, selecting the best-performing kernels and introducing a novel crossover strategy to combine them. Stage 4 builds an Innovation Archive, drawing on past kernel innovations to achieve continuous performance gains, similar to how knowledge accumulates and evolves over time. This multi-stage approach enables ongoing improvements in CUDA kernel performance through both evolutionary techniques and leveraging historical successes.

## PHIA - ReAct based framework
```
Mike A. Merrill, Akshay Paruchuri, Naghmeh Rezaei, et al. "Transforming Wearable Data into Health Insights using Large Language Model Agents." arXiv preprint arXiv:2406.06464 (2024).
```
![phia](/images/rlhf/IMG_4231.png)

PHIA, an agent based on the ReAct framework:
#### Stages of Operation:
- Thought Stage: PHIA formulates a plan to address a query.
- Act Stage: PHIA uses tools like a Python data analysis runtime and a Google Search API to execute tasks and expand its health domain knowledge.
- Observe Stage: PHIA integrates the tools’ outputs into its context to enhance responses.

PHIA engages with wearable data using Python and the Pandas library for precise numerical analysis, ensuring user data privacy.

PHIA retrieves up-to-date health information from reliable web sources, improving its reasoning and credibility.

#### Few-Shot Prompting:
- To master tool use, PHIA employs few-shot prompting, providing high-quality examples for task performance without extensive fine-tuning.

- This involves computing sentence-T5 embeddings for queries, clustering them, and selecting representative queries to demonstrate high-quality responses through iterative planning and code

## LLMCompiler 
![LLMCompilerImage](/images/rlhf/llmcompiler.png)

```
Kim, Sehoon, et al. "An LLM compiler for parallel function calling." arXiv preprint arXiv:2312.04511 (2023).
```

LangChain implementation of LLMCompiler is [here](https://langchain-ai.github.io/langgraph/tutorials/llm-compiler/LLMCompiler/). 


LLMCompiler is a novel framework that optimizes parallel function calling for large language models (LLMs). LLMCompiler agents, in contrast to ReAct, focus on parallel function calling and efficient execution of tasks. They are designed to handle multi-part queries and advanced retrieval-augmented generation (RAG) use cases over multiple documents. The LLMCompiler agent can perform parallel function calls, which allows it to deliver results more quickly than the sequential execution seen in ReAct-based agents

It has the following components
- **Input**: Requires only tool definitions and optional examples from users.
- **Function Calling Planner**: Generates a directed acyclic graph (DAG) of tasks and their dependencies.
- **Task Fetching Unit**: Dispatches tasks and resolves dependencies.
- **Executor**: Executes tasks in parallel using associated tools.

## Reflection

Reflexion is a framework designed to enhance agents' reasoning abilities by providing them with dynamic memory and self-reflection features. It uses a typical reinforcement learning (RL) setup, where a binary reward model is used, and the action space, based on the ReAct framework, is expanded with language to support complex reasoning processes. After each action, the agent calculates a heuristic, which may lead to the decision to reset the environment and start a new trial based on the results of the self-reflection.

![reflexion](/images/rlhf/reflexion.png)

*Reflexion framework. ([Source: Shinn & Labash, 2023](https://arxiv.org/abs/2303.11366))*



