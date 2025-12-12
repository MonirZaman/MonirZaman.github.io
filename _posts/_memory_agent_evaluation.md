## Mastering Long-Term Memory: Building the `task_mAIstro` Agent

Memory is foundational for building truly context-aware and personalized AI applications. We explore how to construct a robust **Memory Agent, `task_mAIstro`**, that utilizes `langgraph` for orchestration and `Trustcall` for structured memory management,. This agent not only remembers facts but also decides *when* to save new information and *how* to use it.

![memory_agent](/images/rl/memory_agent.png)
---

### 🧠 Types of Memory

`task_mAIstro` manages three distinct categories of long-term memory, moving beyond simple profile or collection storage,:

1.  **User Profile (Semantic Memory):** This captures general information about the user, such as their name, location, job, and personal connections or interests,,.
    ```python
    class Profile(BaseModel):
        """This is the profile of the user you are chatting with"""
        name: Optional[str] = Field(...)
        location: Optional[str] = Field(...)
        job: Optional[str] = Field(...)
        connections: list[str] = Field(...)
        interests: list[str] = Field(...)
    ```
2.  **ToDo List (Collection):** A collection of actionable tasks, stored with specific details like time estimates, deadlines, and suggested solutions,,.
    ```python
    class ToDo(BaseModel):
        task: str = Field(description="The task to be completed.")
        time_to_complete: Optional[int] = Field(...)
        deadline: Optional[datetime] = Field(...)
        solutions: list[str] = Field(...)
        status: Literal["not started", "in progress", "done", "archived"] = Field(...)
    ```
3.  **Instructions (Procedural Memory):** These are user-specified preferences or rules that govern *how* the agent should handle updates, such as demanding the inclusion of local vendors in solutions,.

### 🛠️ How to Create a Memory Agent

The agent employs a **ReAct agent architecture** within a `langgraph` framework,.

#### 1. The Core Decision Tool

The central innovation is the agent's ability to decide *which* memory type to update using the `UpdateMemory` tool:

```python
from typing import TypedDict, Literal
class UpdateMemory(TypedDict):
    """ Decision on what memory type to update """
    update_type: Literal['user', 'todo', 'instructions']
```

If the user mentions personal information, the model calls `UpdateMemory(update_type='user')`, routing the conversation to the `update_profile` node via the `route_message` function,,.

#### 2. Graph and Storage

The agent is implemented using a `StateGraph` with four main nodes: the central `task_mAIstro` node and three update nodes (`update_todos`, `update_profile`, `update_instructions`).

*   **Long-term memory** (across-thread) uses an `InMemoryStore` to persist the structured memory schemas.
*   **Short-term memory** (within-thread) uses a `MemorySaver` for the immediate conversation context,.

```python
# Store for long-term (across-thread) memory
across_thread_memory = InMemoryStore()

# Checkpointer for short-term (within-thread) memory
within_thread_memory = MemorySaver()

# Compile the graph
graph = builder.compile(checkpointer=within_thread_memory, store=across_thread_memory)
```

### 💬 Different Prompts

The system uses specialized prompts for decision-making and data extraction:

*   **Model System Message (`MODEL_SYSTEM_MESSAGE`):** This core prompt provides the agent with its identity and the complete context of the user's current memory state (`<user_profile>`, `<todo>`, `<instructions>`),,. Crucially, it dictates the conversational verification behavior, such as **telling the user when the ToDo list is updated, but not when the profile is updated**,.
*   **Trustcall Instruction (`TRUSTCALL_INSTRUCTION`):** Used in the update nodes, this instructs the extractor to "Reflect on [the] interaction" and use tools to retain memories, supporting the critical use of **parallel tool calling** for simultaneous updates and insertions,.

### ✅ How to Verify Memory Updates

Verification is essential for debugging and ensuring memory accuracy.

#### 1. Tool Call Inspection via a Listener

We gain **visibility into the specific changes** made by `Trustcall`—including its internal tools like `PatchDoc` (used for updating existing documents)—by adding a **listener** (`Spy` class) to the `Trustcall` extractor,,,.

The `Spy` class captures the model's raw tool calls:
```python
class Spy:
    def __init__(self):
        self.called_tools = []
    # ... logic to capture tool calls from the chat model run ...
```

The `extract_tool_info` function then interprets these captured calls to provide a human-readable summary, distinguishing between updating an existing document (`PatchDoc`) and creating a new memory,,:

```python
# Example output confirming an update (a 'PatchDoc' call):
"Document 0 updated:\nPlan: 1. Replace the existing content...\nAdded content: Lance had a nice bike ride..."
```,

This structured output is passed back to the main agent as a Tool Message response, providing internal confirmation that the memory operation succeeded.

#### 2. Explicit User Confirmation

As mandated by the `MODEL_SYSTEM_MESSAGE`, the agent explicitly confirms specific actions to the user, creating a clear external verification loop,.

#### 3. Direct Store Query

For development or debugging, the ultimate verification is querying the **long-term memory store** (`across_thread_memory`) directly using the user ID and namespace (e.g., `("instructions", "Lance")`) to confirm the final contents adhere to the schema and reflect the conversation,.
