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

## Agent framework Case Study

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



