Memory-enabled agents typically fail in two ways: they store the wrong information (noise) or they store the right information but cannot reliably retrieve it (access). Memory is foundational for building context-aware, personalized AI. In this post, I walk through a practical approach using a [Memory Agent](https://github.com/langchain-ai/langchain-academy/blob/main/module-5/memory_agent.ipynb) built with LangGraph. This agent doesn't just store facts; it autonomously decides when to commit information to long-term storage and how to surface it. Finally, I’ll demonstrate how to evaluate these behaviors using concrete metrics grounded in the LongMemEval benchmark.

![memory_agent](/images/rlhf/memory_agent.png)

This agent performs various memory related functionality. It can be evaluated in the following criteria
- Routing correctness: how accurate it calls the memory methods such as update memory.
- Writing correctness: whether the memory after an update matches what user meant
- Retrieval correctness: whether the agent retrieves the right memories for the given query
- Temporal correctness: whether time related fields and status transitions are correct

## 🌐 High-Level Architecture: From Stateless to Stateful

Memory agent called `task_mAIstro` acts as a central orchestrator that transforms an LLM into a context-aware system. It differentiates itself through four architectural pillars:

  * **Contextual Persistence:** It implements a tiered memory system (Semantic, Episodic, Procedural).
  * **Dynamic Routing:** It utilizes a graph-based state machine to determine *when* to write to memory versus *when* to simply respond.
  * **Verifiability:** It rejects "black box" memory in favor of inspectable, structured storage.
  * **Composability:** built on the `langgraph` framework, allowing for modular extension.

### The Execution Flow

1.  **Ingestion:** User input enters the system.
2.  **Cognitive Routing:** A decision tool (`UpdateMemory`) analyzes the intent. Does this input require a change to the user's profile, the task list, or the rules of engagement?
3.  **State Transition:** The graph routes the state to a specific update node (`update_profile`, `update_todos`, etc.).
4.  **Consolidation:** Data is committed to the `InMemoryStore` (Long-term) or `MemorySaver` (Short-term/Thread-level).
5.  **Feedback Loop:** The system verifies the write operation via internal "Spy" listeners or external user confirmation.

-----

## 🧠 The Taxonomy of AI Memory

To build a truly intelligent agent, we must move beyond a generic "context window." `task_mAIstro` segments data into three distinct cognitive categories, mimicking human memory systems:

| Memory Type | Cognitive Equivalent | Description | Data Structure |
| :--- | :--- | :--- | :--- |
| **Semantic** | **User Profile** | General facts and static knowledge about the user (Who they are). | `Profile` Schema |
| **Episodic** | **ToDo List** | Temporal, event-based memory tracking specific tasks and states (What they need to do). | `ToDo` Schema |
| **Procedural** | **Instructions** | Implicit rules and preferences governing *how* the agent should behave. | String / List |

### Structured Schema Definitions

By using Pydantic, we enforce strict typing on our memory, preventing hallucinations from corrupting the agent's long-term state.

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal, List
from datetime import datetime

# Semantic Memory (The "Who")
class Profile(BaseModel):
    name: Optional[str] = Field(description="User's preferred name")
    location: Optional[str] = Field(description="Current geographical context")
    job: Optional[str] = Field(description="Professional role")
    interests: List[str] = Field(description="Topics of engagement")

# Episodic Memory (The "What")
class ToDo(BaseModel):
    task: str = Field(description="Actionable item")
    deadline: Optional[datetime] = Field(description="Hard constraint for completion")
    solutions: List[str] = Field(description="Proposed pathways to completion")
    status: Literal["not started", "in progress", "done", "archived"]

# Procedural Memory is handled via raw instruction strings injection.
```

-----

## 🔗 The `StateGraph`: Orchestrating Cognition

The nervous system of `task_mAIstro` is the **StateGraph**. This defines the deterministic flows between reasoning and memory updates.

Unlike a linear chain, this graph allows for **conditional branching**:

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal

# Define the State schema to track routing intent
class AgentState(TypedDict):
    update_type: Literal["user", "todo", "instructions", "none"]
    messages: list

# Initialize the Graph
builder = StateGraph(AgentState)

# 1. Define Nodes (The Functional Units)
builder.add_node("task_mAIstro", task_mAIstro_agent)
builder.add_node("update_profile", update_profile_tool)
builder.add_node("update_todos", update_todos_tool)
builder.add_node("update_instructions", update_instructions_tool)

# 2. Define Conditional Routing (The Logic)
def route_memory(state: AgentState):
    """Determines which memory subsystem requires an update."""
    return state.get("update_type", "none")

builder.add_conditional_edges(
    "task_mAIstro", 
    route_memory,
    {
        "user": "update_profile",
        "todo": "update_todos",
        "instructions": "update_instructions",
        "none": END
    }
)

# 3. Define Re-entry (The Feedback Loop)
# After memory is updated, loop back to the agent to confirm or continue
builder.add_edge("update_profile", "task_mAIstro")
builder.add_edge("update_todos", "task_mAIstro")
builder.add_edge("update_instructions", "task_mAIstro")

# 4. Compile
builder.set_entry_point("task_mAIstro")
graph = builder.compile()
```

-----

## ✅ Trust and Verification

A memory system is only as good as its accuracy. `task_mAIstro` implements a "Trust but Verify" protocol:

1.  **Observability (The "Spy"):**
    We attach a listener to the tool execution stream. This allows developers to inspect the raw `PatchDoc` calls—seeing exactly how the JSON patch was applied to the memory store.

    > *Log Output:* `Document 0 updated: Plan: Replace 'location' value. Result: 'Sammamish, WA'`

2.  **Explicit User Confirmation:**
    For high-stakes episodic memory (like modifying a deadline), the agent is instructed to request verbal confirmation before committing the state change.

3.  **Direct Store Inspection:**
    Developers can bypass the agent simulation and query the KV (Key-Value) store directly to debug state issues.

    ```python
    # Direct access to the instruction namespace for user 'Lance'
    current_rules = across_thread_memory.get(("instructions", "Lance"))
    ```

(More evaluation code upcoming )

-----

## ✅ Metrics
Let's apply a one metric as an example to showcase evaluation of the memory agent. Recall write correctness metric as following.

- Write correctness: Agent returns the correct memory after an update

```
store = InMemoryStore()
user_id = "u123"
profile_ns = ("profile", user_id)

# initial write
graph.invoke(
  {"messages": [{"role": "user", "content": "My name is Sam"}]},
  config={"configurable": {"user_id": user_id}, "thread_id": thread_id},
  store=store
)

# update profile
graph.invoke(
  {"messages": [{"role": "user", "content": "Actually use my full name Samantha"}]},
  config={"configurable": {"user_id": user_id}, "thread_id": thread_id},
  store=store
)

# retrieve the memory
result = store.search(profile_ns)
<your-favority-evaluator>(result, {"name": "Samantha"})
```

-----

## ✅ Memory Benchmark 
Public benchmark such as [LongMemEval](https://arxiv.org/abs/2410.10813) evaluates long-term interactive memory in chat assistants. It tests whether a system can store, retrieve, update and reason over information that appears across many user-assistant sessions. 

### Example of Information Extraction
**Session 1**  
User: My cat Luna is 3 years old and loves salmon treats.

**Session 2**  
Q: What is the name of my cat? 

Expected Answer: Luna

### Code snippet showcasing memory agent evaluation through the benchmark

- Step A: Run a given test case
```python
def run_test_case(graph, testcase, ..):
    # get session history
    qid = testcase["question_id"]
    haystack_sessions = testcase["haystack_sessions"]

    # step 1: Replaying session turns
    for si, session in enumerate(haystack_sessions):
       # if it is user-only mode for evaluation, run each user turn
       for ti, turn in enumerate(session):
         _ = graph.invoke(
                  {"messages": [{"role": "user", "content":"<context prefix such as date>" + turn.get("content", "")}]},
                   config={"configurable": {"user_id": <user_id>}, "thread_id": <thread_id>}, store=<store>)

        # otherwise ingest session as history
        _ = graph.invoke(
                  {"messages": [{"role": "user", "content":"<context prefix such as date>" + "<concatenated_session_history>"}]},
                   config={"configurable": {"user_id": <user_id>}, "thread_id": <thread_id>}, store=<store>)


    # step 2: Ask the benchmark question in a new turn
    return {
        "hypothesis_id": qid,
        "hypothesis": graph.invoke(
                  {"messages": [{"role": "user", "content": "<context prefix such as date>" + testcase["question"]}]},
                   config={"configurable": {"user_id": <user_id>}, "thread_id": <thread_id>}, store=<store>)

    }
```

- Step B: Iterate over dataset to generate prediction
```python
for _, testcase in enumerate(longmemeval_dataset):
  prediction = run_test_case(graph, testcase, ..)
  file.write(json.dumps(pred) + "\n")
```
- Step C: Scoring with LongMemEval LLM-as-judge
```python
python3 evaluate_qa.py \
   gpt-4o \
   <path-to-predictions.jsonl file> \
   <path-to-longmemeval benchmark.json file>
``` 
This will produce per-item labels and aggregated metrics.

-----

## 🚀 Conclusion

Memory agent represents a shift from **reactive** AI to **accumulative** AI. By unifying semantic, episodic, and procedural memory into a single graph-based architecture, we create agents that do not just process tokens—they build relationships and maintain continuity.

This architecture balances the flexibility of LLMs with the rigidity required for reliable software, ensuring your agent becomes a long-term partner rather than a fleeting conversationalist.

## Additional resource
- [OpenAI memory cook book]( https://cookbook.openai.com/examples/agents_sdk/context_personalization)
- [Oracle memory agent](https://github.com/oracle-devrel/oracle-ai-developer-hub/blob/main/notebooks/memory_context_engineering_agents.ipynb)

