# LangChain: Q&A over Documents

An example might be a tool that would allow you to query a product catalog for items of interest.


```python
#pip install --upgrade langchain
```


```python
import os

from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv()) # read local .env file
```


```python
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.document_loaders import CSVLoader
from langchain.vectorstores import DocArrayInMemorySearch
from IPython.display import display, Markdown
```


```python
file = 'OutdoorClothingCatalog_1000.csv'
loader = CSVLoader(file_path=file)
```


```python
from langchain.indexes import VectorstoreIndexCreator
```


```python
#pip install docarray
help(loader)

```

    Help on CSVLoader in module langchain.document_loaders.csv_loader object:
    
    class CSVLoader(langchain.document_loaders.base.BaseLoader)
     |  CSVLoader(file_path: str, source_column: Optional[str] = None, csv_args: Optional[Dict] = None, encoding: Optional[str] = None)
     |  
     |  Loads a CSV file into a list of documents.
     |  
     |  Each document represents one row of the CSV file. Every row is converted into a
     |  key/value pair and outputted to a new line in the document's page_content.
     |  
     |  The source for each document loaded from csv is set to the value of the
     |  `file_path` argument for all doucments by default.
     |  You can override this by setting the `source_column` argument to the
     |  name of a column in the CSV file.
     |  The source of each document will then be set to the value of the column
     |  with the name specified in `source_column`.
     |  
     |  Output Example:
     |      .. code-block:: txt
     |  
     |          column1: value1
     |          column2: value2
     |          column3: value3
     |  
     |  Method resolution order:
     |      CSVLoader
     |      langchain.document_loaders.base.BaseLoader
     |      abc.ABC
     |      builtins.object
     |  
     |  Methods defined here:
     |  
     |  __init__(self, file_path: str, source_column: Optional[str] = None, csv_args: Optional[Dict] = None, encoding: Optional[str] = None)
     |      Initialize self.  See help(type(self)) for accurate signature.
     |  
     |  load(self) -> List[langchain.schema.Document]
     |      Load data into document objects.
     |  
     |  ----------------------------------------------------------------------
     |  Data and other attributes defined here:
     |  
     |  __abstractmethods__ = frozenset()
     |  
     |  ----------------------------------------------------------------------
     |  Methods inherited from langchain.document_loaders.base.BaseLoader:
     |  
     |  lazy_load(self) -> Iterator[langchain.schema.Document]
     |      A lazy loader for document content.
     |  
     |  load_and_split(self, text_splitter: Optional[langchain.text_splitter.TextSplitter] = None) -> List[langchain.schema.Document]
     |      Load documents and split into chunks.
     |  
     |  ----------------------------------------------------------------------
     |  Data descriptors inherited from langchain.document_loaders.base.BaseLoader:
     |  
     |  __dict__
     |      dictionary for instance variables (if defined)
     |  
     |  __weakref__
     |      list of weak references to the object (if defined)
    



```python
index = VectorstoreIndexCreator(
    vectorstore_cls=DocArrayInMemorySearch
).from_loaders([loader])
```


```python
query ="Please list all your shirts with sun protection \
in a table in markdown and summarize each one."
```


```python
response = index.query(query)
```


```python
display(Markdown(response))
```




| Name | Description |
| --- | --- |
| Men's Tropical Plaid Short-Sleeve Shirt | UPF 50+ rated, 100% polyester, wrinkle-resistant, front and back cape venting, two front bellows pockets |
| Men's Plaid Tropic Shirt, Short-Sleeve | UPF 50+ rated, 52% polyester and 48% nylon, machine washable and dryable, front and back cape venting, two front bellows pockets |
| Men's TropicVibe Shirt, Short-Sleeve | UPF 50+ rated, 71% Nylon, 29% Polyester, 100% Polyester knit mesh, machine wash and dry, front and back cape venting, two front bellows pockets |
| Sun Shield Shirt by | UPF 50+ rated, 78% nylon, 22% Lycra Xtra Life fiber, handwash, line dry, wicks moisture, fits comfortably over swimsuit, abrasion resistant |

All four shirts provide UPF 50+ sun protection, blocking 98% of the sun's harmful rays. The Men's Tropical Plaid Short-Sleeve Shirt is made of 100% polyester and is wrinkle-resistant



```python
loader = CSVLoader(file_path=file)
```


```python
docs = loader.load()
```


```python
docs[0]
```




    Document(page_content=": 0\nname: Women's Campside Oxfords\ndescription: This ultracomfortable lace-to-toe Oxford boasts a super-soft canvas, thick cushioning, and quality construction for a broken-in feel from the first time you put them on. \n\nSize & Fit: Order regular shoe size. For half sizes not offered, order up to next whole size. \n\nSpecs: Approx. weight: 1 lb.1 oz. per pair. \n\nConstruction: Soft canvas material for a broken-in feel and look. Comfortable EVA innersole with Cleansport NXT® antimicrobial odor control. Vintage hunt, fish and camping motif on innersole. Moderate arch contour of innersole. EVA foam midsole for cushioning and support. Chain-tread-inspired molded rubber outsole with modified chain-tread pattern. Imported. \n\nQuestions? Please contact us for any inquiries.", metadata={'source': 'OutdoorClothingCatalog_1000.csv', 'row': 0})




```python
from langchain.embeddings import OpenAIEmbeddings
embeddings = OpenAIEmbeddings()
```


```python
embed = embeddings.embed_query("Hi my name is Harrison")
```


```python
print(len(embed))
```

    1536



```python
print(embed[:5])
```

    [-0.021913960576057434, 0.006774206645786762, -0.018190348520874977, -0.039148248732089996, -0.014089343138039112]



```python
db = DocArrayInMemorySearch.from_documents(
    docs, 
    embeddings
)
```


```python
query = "Please suggest a shirt with sunblocking"
```


```python
docs = db.similarity_search(query)
```


```python
len(docs)
```




    4




```python
docs[0]
```




    Document(page_content=': 255\nname: Sun Shield Shirt by\ndescription: "Block the sun, not the fun – our high-performance sun shirt is guaranteed to protect from harmful UV rays. \n\nSize & Fit: Slightly Fitted: Softly shapes the body. Falls at hip.\n\nFabric & Care: 78% nylon, 22% Lycra Xtra Life fiber. UPF 50+ rated – the highest rated sun protection possible. Handwash, line dry.\n\nAdditional Features: Wicks moisture for quick-drying comfort. Fits comfortably over your favorite swimsuit. Abrasion resistant for season after season of wear. Imported.\n\nSun Protection That Won\'t Wear Off\nOur high-performance fabric provides SPF 50+ sun protection, blocking 98% of the sun\'s harmful rays. This fabric is recommended by The Skin Cancer Foundation as an effective UV protectant.', metadata={'source': 'OutdoorClothingCatalog_1000.csv', 'row': 255})




```python
retriever = db.as_retriever()
```


```python
llm = ChatOpenAI(temperature = 0.0)

```


```python
qdocs = "".join([docs[i].page_content for i in range(len(docs))])

```


```python
response = llm.call_as_llm(f"{qdocs} Question: Please list all your \
shirts with sun protection in a table in markdown and summarize each one.") 

```


```python
response = llm.call_as_llm(f"{qdocs} Question: Please list all your \
sunscreens") 

```


```python
display(Markdown(response))
```


I'm sorry, as an AI language model, I don't have access to a specific person's personal information or inventory. Please provide more context or clarify your request.



```python
qa_stuff = RetrievalQA.from_chain_type(
    llm=llm, 
    chain_type="stuff", 
    retriever=retriever, 
    verbose=True
)
```


```python
query =  "Please list all your shirts with sun protection in json format \
in markdown and summarize each one."
```


```python
response = qa_stuff.run(query)
```

    
    
    [1m> Entering new RetrievalQA chain...[0m
    
    [1m> Finished chain.[0m



```python
display(Markdown(response))
```


Sorry, as an AI language model, I don't have access to the product database. However, based on the context provided, I can provide a sample JSON format for one of the shirts:

```
{
    "id": 618,
    "name": "Men's Tropical Plaid Short-Sleeve Shirt",
    "description": "Our lightest hot-weather shirt is rated UPF 50+ for superior protection from the sun's UV rays. With a traditional fit that is relaxed through the chest, sleeve, and waist, this fabric is made of 100% polyester and is wrinkle-resistant. With front and back cape venting that lets in cool breezes and two front bellows pockets, this shirt is imported and provides the highest rated sun protection possible.",
    "features": [
        "UPF 50+ rated – the highest rated sun protection possible",
        "Made of 100% polyester",
        "Wrinkle-resistant",
        "Front and back cape venting",
        "Two front bellows pockets"
    ]
}
```

This shirt is a Men's Tropical Plaid Short-Sleeve Shirt with UPF 50+ sun protection. It has a traditional fit that is relaxed through the chest, sleeve, and waist. The fabric is made of 100% polyester and is wrinkle-resistant. It also has front and back cape venting that lets in cool breezes and two front bellows pockets.



```python
response = index.query(query, llm=llm)
```


```python
index = VectorstoreIndexCreator(
    vectorstore_cls=DocArrayInMemorySearch,
    embedding=embeddings,
).from_loaders([loader])
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
