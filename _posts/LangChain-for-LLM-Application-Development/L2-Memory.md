# LangChain: Memory

## Outline
* ConversationBufferMemory
* ConversationBufferWindowMemory
* ConversationTokenBufferMemory
* ConversationSummaryMemory

## ConversationBufferMemory


```python
import os

from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv()) # read local .env file

import warnings
warnings.filterwarnings('ignore')
```


```python
from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

```


```python
llm = ChatOpenAI(temperature=0.0)
memory = ConversationBufferMemory()
conversation = ConversationChain(
    llm=llm, 
    memory = memory,
    verbose=True
)
```


```python
conversation.predict(input="Hi, my name is Andrew")
```


```python
conversation.predict(input="What is 1+1?")
```


```python
conversation.predict(input="What is my name?")
```


```python
print(memory.buffer)
```


```python
memory.load_memory_variables({})
```


```python
memory = ConversationBufferMemory()
```


```python
memory.save_context({"input": "Hi"}, 
                    {"output": "What's up"})
```


```python
print(memory.buffer)
```


```python
memory.load_memory_variables({})
```


```python
memory.save_context({"input": "Not much, just hanging"}, 
                    {"output": "Cool"})
```


```python
memory.load_memory_variables({})
```

## ConversationBufferWindowMemory


```python
from langchain.memory import ConversationBufferWindowMemory
```


```python
memory = ConversationBufferWindowMemory(k=1)               
```


```python
memory.save_context({"input": "Hi"},
                    {"output": "What's up"})
memory.save_context({"input": "Not much, just hanging"},
                    {"output": "Cool"})

```


```python
memory.load_memory_variables({})
```


```python
llm = ChatOpenAI(temperature=0.0)
memory = ConversationBufferWindowMemory(k=1)
conversation = ConversationChain(
    llm=llm, 
    memory = memory,
    verbose=False
)
```


```python
conversation.predict(input="Hi, my name is Andrew")
```


```python
conversation.predict(input="What is 1+1?")
```


```python
conversation.predict(input="What is my name?")
```

## ConversationTokenBufferMemory


```python
#!pip install tiktoken
```


```python
from langchain.memory import ConversationTokenBufferMemory
from langchain.llms import OpenAI
llm = ChatOpenAI(temperature=0.0)
```


```python
memory = ConversationTokenBufferMemory(llm=llm, max_token_limit=30)
memory.save_context({"input": "AI is what?!"},
                    {"output": "Amazing!"})
memory.save_context({"input": "Backpropagation is what?"},
                    {"output": "Beautiful!"})
memory.save_context({"input": "Chatbots are what?"}, 
                    {"output": "Charming!"})
```


```python
memory.load_memory_variables({})
```

## ConversationSummaryMemory


```python
from langchain.memory import ConversationSummaryBufferMemory

```


```python
# create a long string
schedule = "There is a meeting at 8am with your product team. \
You will need your powerpoint presentation prepared. \
9am-12pm have time to work on your LangChain \
project which will go quickly because Langchain is such a powerful tool. \
At Noon, lunch at the italian resturant with a customer who is driving \
from over an hour away to meet you to understand the latest in AI. \
Be sure to bring your laptop to show the latest LLM demo."

memory = ConversationSummaryBufferMemory(llm=llm, max_token_limit=100)
memory.save_context({"input": "Hello"}, {"output": "What's up"})
memory.save_context({"input": "Not much, just hanging"},
                    {"output": "Cool"})
memory.save_context({"input": "What is on the schedule today?"}, 
                    {"output": f"{schedule}"})
```


```python
memory.load_memory_variables({})
```


```python
conversation = ConversationChain(
    llm=llm, 
    memory = memory,
    verbose=True
)
```


```python
conversation.predict(input="What would be a good demo to show?")
```


```python
memory.load_memory_variables({})
```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```


```python

```
