# LangChain: Evaluation

## Outline:

* Example generation
* Manual evaluation (and debuging)
* LLM-assisted evaluation


```python
import os

from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv()) # read local .env file
```

## Create our QandA application


```python
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.document_loaders import CSVLoader
from langchain.indexes import VectorstoreIndexCreator
from langchain.vectorstores import DocArrayInMemorySearch
```


```python
file = 'OutdoorClothingCatalog_1000.csv'
loader = CSVLoader(file_path=file)
data = loader.load()
```


```python
index = VectorstoreIndexCreator(
    vectorstore_cls=DocArrayInMemorySearch
).from_loaders([loader])
```


```python
llm = ChatOpenAI(temperature = 0.0)
qa = RetrievalQA.from_chain_type(
    llm=llm, 
    chain_type="stuff", 
    retriever=index.vectorstore.as_retriever(), 
    verbose=True,
    chain_type_kwargs = {
        "document_separator": "<<<<>>>>>"
    }
)
```

### Coming up with test datapoints


```python
data[10]
```




    Document(page_content=": 10\nname: Cozy Comfort Pullover Set, Stripe\ndescription: Perfect for lounging, this striped knit set lives up to its name. We used ultrasoft fabric and an easy design that's as comfortable at bedtime as it is when we have to make a quick run out.\n\nSize & Fit\n- Pants are Favorite Fit: Sits lower on the waist.\n- Relaxed Fit: Our most generous fit sits farthest from the body.\n\nFabric & Care\n- In the softest blend of 63% polyester, 35% rayon and 2% spandex.\n\nAdditional Features\n- Relaxed fit top with raglan sleeves and rounded hem.\n- Pull-on pants have a wide elastic waistband and drawstring, side pockets and a modern slim leg.\n\nImported.", metadata={'source': 'OutdoorClothingCatalog_1000.csv', 'row': 10})




```python
data[11]
```




    Document(page_content=': 11\nname: Ultra-Lofty 850 Stretch Down Hooded Jacket\ndescription: This technical stretch down jacket from our DownTek collection is sure to keep you warm and comfortable with its full-stretch construction providing exceptional range of motion. With a slightly fitted style that falls at the hip and best with a midweight layer, this jacket is suitable for light activity up to 20° and moderate activity up to -30°. The soft and durable 100% polyester shell offers complete windproof protection and is insulated with warm, lofty goose down. Other features include welded baffles for a no-stitch construction and excellent stretch, an adjustable hood, an interior media port and mesh stash pocket and a hem drawcord. Machine wash and dry. Imported.', metadata={'source': 'OutdoorClothingCatalog_1000.csv', 'row': 11})



### Hard-coded examples


```python
examples = [
    {
        "query": "Do the Cozy Comfort Pullover Set\
        have side pockets?",
        "answer": "Yes"
    },
    {
        "query": "What collection is the Ultra-Lofty \
        850 Stretch Down Hooded Jacket from?",
        "answer": "The DownTek collection"
    }
]
```

### LLM-Generated examples


```python
from langchain.evaluation.qa import QAGenerateChain

```


```python
example_gen_chain = QAGenerateChain.from_llm(ChatOpenAI())
```


```python
new_examples = example_gen_chain.apply_and_parse(
    [{"doc": t} for t in data[:5]]
)
```


```python
new_examples[0]
```




    {'query': "What is the weight of each pair of Women's Campside Oxfords?",
     'answer': "The approximate weight of each pair of Women's Campside Oxfords is 1 lb. 1 oz."}




```python
data[0]
```




    Document(page_content=": 0\nname: Women's Campside Oxfords\ndescription: This ultracomfortable lace-to-toe Oxford boasts a super-soft canvas, thick cushioning, and quality construction for a broken-in feel from the first time you put them on. \n\nSize & Fit: Order regular shoe size. For half sizes not offered, order up to next whole size. \n\nSpecs: Approx. weight: 1 lb.1 oz. per pair. \n\nConstruction: Soft canvas material for a broken-in feel and look. Comfortable EVA innersole with Cleansport NXT® antimicrobial odor control. Vintage hunt, fish and camping motif on innersole. Moderate arch contour of innersole. EVA foam midsole for cushioning and support. Chain-tread-inspired molded rubber outsole with modified chain-tread pattern. Imported. \n\nQuestions? Please contact us for any inquiries.", metadata={'source': 'OutdoorClothingCatalog_1000.csv', 'row': 0})



### Combine examples


```python
examples += new_examples
```


```python
qa.run(examples[0]["query"])
```

    
    
    [1m> Entering new RetrievalQA chain...[0m
    
    [1m> Finished chain.[0m





    'The Cozy Comfort Pullover Set, Stripe does have side pockets.'



## Manual Evaluation


```python
import langchain
langchain.debug = True
```


```python
qa.run(examples[0]["query"])
```

    [32;1m[1;3m[chain/start][0m [1m[1:chain:RetrievalQA] Entering Chain run with input:
    [0m{
      "query": "Do the Cozy Comfort Pullover Set have side pockets?"
    }
    [32;1m[1;3m[chain/start][0m [1m[1:chain:RetrievalQA > 2:chain:StuffDocumentsChain] Entering Chain run with input:
    [0m[inputs]
    [32;1m[1;3m[chain/start][0m [1m[1:chain:RetrievalQA > 2:chain:StuffDocumentsChain > 3:chain:LLMChain] Entering Chain run with input:
    [0m{
      "question": "Do the Cozy Comfort Pullover Set have side pockets?",
      "context": ": 10\nname: Cozy Comfort Pullover Set, Stripe\ndescription: Perfect for lounging, this striped knit set lives up to its name. We used ultrasoft fabric and an easy design that's as comfortable at bedtime as it is when we have to make a quick run out.\n\nSize & Fit\n- Pants are Favorite Fit: Sits lower on the waist.\n- Relaxed Fit: Our most generous fit sits farthest from the body.\n\nFabric & Care\n- In the softest blend of 63% polyester, 35% rayon and 2% spandex.\n\nAdditional Features\n- Relaxed fit top with raglan sleeves and rounded hem.\n- Pull-on pants have a wide elastic waistband and drawstring, side pockets and a modern slim leg.\n\nImported.<<<<>>>>>: 73\nname: Cozy Cuddles Knit Pullover Set\ndescription: Perfect for lounging, this knit set lives up to its name. We used ultrasoft fabric and an easy design that's as comfortable at bedtime as it is when we have to make a quick run out. \n\nSize & Fit \nPants are Favorite Fit: Sits lower on the waist. \nRelaxed Fit: Our most generous fit sits farthest from the body. \n\nFabric & Care \nIn the softest blend of 63% polyester, 35% rayon and 2% spandex.\n\nAdditional Features \nRelaxed fit top with raglan sleeves and rounded hem. \nPull-on pants have a wide elastic waistband and drawstring, side pockets and a modern slim leg. \nImported.<<<<>>>>>: 151\nname: Cozy Quilted Sweatshirt\ndescription: Our sweatshirt is an instant classic with its great quilted texture and versatile weight that easily transitions between seasons. With a traditional fit that is relaxed through the chest, sleeve, and waist, this pullover is lightweight enough to be worn most months of the year. The cotton blend fabric is super soft and comfortable, making it the perfect casual layer. To make dressing easy, this sweatshirt also features a snap placket and a heritage-inspired Mt. Katahdin logo patch. For care, machine wash and dry. Imported.<<<<>>>>>: 265\nname: Cozy Workout Vest\ndescription: For serious warmth that won't weigh you down, reach for this fleece-lined vest, which provides you with layering options whether you're inside or outdoors.\nSize & Fit\nRelaxed Fit. Falls at hip.\nFabric & Care\nSoft, textured fleece lining. Nylon shell. Machine wash and dry. \nAdditional Features \nTwo handwarmer pockets. Knit side panels stretch for a more flattering fit. Shell fabric is treated to resist water and stains. Imported."
    }
    [32;1m[1;3m[llm/start][0m [1m[1:chain:RetrievalQA > 2:chain:StuffDocumentsChain > 3:chain:LLMChain > 4:llm:ChatOpenAI] Entering LLM run with input:
    [0m{
      "prompts": [
        "System: Use the following pieces of context to answer the users question. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.\n----------------\n: 10\nname: Cozy Comfort Pullover Set, Stripe\ndescription: Perfect for lounging, this striped knit set lives up to its name. We used ultrasoft fabric and an easy design that's as comfortable at bedtime as it is when we have to make a quick run out.\n\nSize & Fit\n- Pants are Favorite Fit: Sits lower on the waist.\n- Relaxed Fit: Our most generous fit sits farthest from the body.\n\nFabric & Care\n- In the softest blend of 63% polyester, 35% rayon and 2% spandex.\n\nAdditional Features\n- Relaxed fit top with raglan sleeves and rounded hem.\n- Pull-on pants have a wide elastic waistband and drawstring, side pockets and a modern slim leg.\n\nImported.<<<<>>>>>: 73\nname: Cozy Cuddles Knit Pullover Set\ndescription: Perfect for lounging, this knit set lives up to its name. We used ultrasoft fabric and an easy design that's as comfortable at bedtime as it is when we have to make a quick run out. \n\nSize & Fit \nPants are Favorite Fit: Sits lower on the waist. \nRelaxed Fit: Our most generous fit sits farthest from the body. \n\nFabric & Care \nIn the softest blend of 63% polyester, 35% rayon and 2% spandex.\n\nAdditional Features \nRelaxed fit top with raglan sleeves and rounded hem. \nPull-on pants have a wide elastic waistband and drawstring, side pockets and a modern slim leg. \nImported.<<<<>>>>>: 151\nname: Cozy Quilted Sweatshirt\ndescription: Our sweatshirt is an instant classic with its great quilted texture and versatile weight that easily transitions between seasons. With a traditional fit that is relaxed through the chest, sleeve, and waist, this pullover is lightweight enough to be worn most months of the year. The cotton blend fabric is super soft and comfortable, making it the perfect casual layer. To make dressing easy, this sweatshirt also features a snap placket and a heritage-inspired Mt. Katahdin logo patch. For care, machine wash and dry. Imported.<<<<>>>>>: 265\nname: Cozy Workout Vest\ndescription: For serious warmth that won't weigh you down, reach for this fleece-lined vest, which provides you with layering options whether you're inside or outdoors.\nSize & Fit\nRelaxed Fit. Falls at hip.\nFabric & Care\nSoft, textured fleece lining. Nylon shell. Machine wash and dry. \nAdditional Features \nTwo handwarmer pockets. Knit side panels stretch for a more flattering fit. Shell fabric is treated to resist water and stains. Imported.\nHuman: Do the Cozy Comfort Pullover Set have side pockets?"
      ]
    }
    [36;1m[1;3m[llm/end][0m [1m[1:chain:RetrievalQA > 2:chain:StuffDocumentsChain > 3:chain:LLMChain > 4:llm:ChatOpenAI] [1.73s] Exiting LLM run with output:
    [0m{
      "generations": [
        [
          {
            "text": "The Cozy Comfort Pullover Set, Stripe does have side pockets.",
            "generation_info": null,
            "message": {
              "content": "The Cozy Comfort Pullover Set, Stripe does have side pockets.",
              "additional_kwargs": {},
              "example": false
            }
          }
        ]
      ],
      "llm_output": {
        "token_usage": {
          "prompt_tokens": 628,
          "completion_tokens": 14,
          "total_tokens": 642
        },
        "model_name": "gpt-3.5-turbo"
      }
    }
    [36;1m[1;3m[chain/end][0m [1m[1:chain:RetrievalQA > 2:chain:StuffDocumentsChain > 3:chain:LLMChain] [1.73s] Exiting Chain run with output:
    [0m{
      "text": "The Cozy Comfort Pullover Set, Stripe does have side pockets."
    }
    [36;1m[1;3m[chain/end][0m [1m[1:chain:RetrievalQA > 2:chain:StuffDocumentsChain] [1.73s] Exiting Chain run with output:
    [0m{
      "output_text": "The Cozy Comfort Pullover Set, Stripe does have side pockets."
    }
    [36;1m[1;3m[chain/end][0m [1m[1:chain:RetrievalQA] [1.97s] Exiting Chain run with output:
    [0m{
      "result": "The Cozy Comfort Pullover Set, Stripe does have side pockets."
    }





    'The Cozy Comfort Pullover Set, Stripe does have side pockets.'




```python
# Turn off the debug mode
langchain.debug = False
```

## LLM assisted evaluation


```python
predictions = qa.apply(examples)
```

    
    
    [1m> Entering new RetrievalQA chain...[0m
    
    [1m> Finished chain.[0m
    
    
    [1m> Entering new RetrievalQA chain...[0m
    
    [1m> Finished chain.[0m
    
    
    [1m> Entering new RetrievalQA chain...[0m
    
    [1m> Finished chain.[0m
    
    
    [1m> Entering new RetrievalQA chain...[0m
    
    [1m> Finished chain.[0m
    
    
    [1m> Entering new RetrievalQA chain...[0m
    
    [1m> Finished chain.[0m
    
    
    [1m> Entering new RetrievalQA chain...[0m
    
    [1m> Finished chain.[0m
    
    
    [1m> Entering new RetrievalQA chain...[0m
    
    [1m> Finished chain.[0m



```python
from langchain.evaluation.qa import QAEvalChain
```


```python
llm = ChatOpenAI(temperature=0)
eval_chain = QAEvalChain.from_llm(llm)
```


```python
graded_outputs = eval_chain.evaluate(examples, predictions)
```


```python
for i, eg in enumerate(examples):
    print(f"Example {i}:")
    print("Question: " + predictions[i]['query'])
    print("Real Answer: " + predictions[i]['answer'])
    print("Predicted Answer: " + predictions[i]['result'])
    print("Predicted Grade: " + graded_outputs[i]['text'])
    print()
```

    Example 0:
    Question: Do the Cozy Comfort Pullover Set have side pockets?
    Real Answer: Yes
    Predicted Answer: The Cozy Comfort Pullover Set, Stripe does have side pockets.
    Predicted Grade: CORRECT
    
    Example 1:
    Question: What collection is the Ultra-Lofty 850 Stretch Down Hooded Jacket from?
    Real Answer: The DownTek collection
    Predicted Answer: The Ultra-Lofty 850 Stretch Down Hooded Jacket is from the DownTek collection.
    Predicted Grade: CORRECT
    
    Example 2:
    Question: What is the weight of each pair of Women's Campside Oxfords?
    Real Answer: The approximate weight of each pair of Women's Campside Oxfords is 1 lb. 1 oz.
    Predicted Answer: The weight of each pair of Women's Campside Oxfords is approximately 1 lb. 1 oz.
    Predicted Grade: CORRECT
    
    Example 3:
    Question: What are the dimensions of the small and medium Recycled Waterhog Dog Mat?
    Real Answer: The dimensions of the small Recycled Waterhog Dog Mat are 18" x 28" and the dimensions of the medium Recycled Waterhog Dog Mat are 22.5" x 34.5".
    Predicted Answer: The small Recycled Waterhog Dog Mat has dimensions of 18" x 28" and the medium size has dimensions of 22.5" x 34.5".
    Predicted Grade: CORRECT
    
    Example 4:
    Question: What are some features of the Infant and Toddler Girls' Coastal Chill Swimsuit?
    Real Answer: The swimsuit features bright colors, ruffles, and exclusive whimsical prints. It is made of four-way-stretch and chlorine-resistant fabric, ensuring that it keeps its shape and resists snags. The swimsuit is also UPF 50+ rated, providing the highest rated sun protection possible by blocking 98% of the sun's harmful rays. The crossover no-slip straps and fully lined bottom ensure a secure fit and maximum coverage. Finally, it can be machine washed and line dried for best results.
    Predicted Answer: The Infant and Toddler Girls' Coastal Chill Swimsuit is a two-piece swimsuit with bright colors, ruffles, and exclusive whimsical prints. It is made of four-way-stretch and chlorine-resistant fabric that keeps its shape and resists snags. The swimsuit has UPF 50+ rated fabric that provides the highest rated sun protection possible, blocking 98% of the sun's harmful rays. The crossover no-slip straps and fully lined bottom ensure a secure fit and maximum coverage. It is machine washable and should be line dried for best results.
    Predicted Grade: CORRECT
    
    Example 5:
    Question: What is the fabric composition of the Refresh Swimwear V-Neck Tankini Contrasts?
    Real Answer: The body of the Refresh Swimwear V-Neck Tankini Contrasts is made of 82% recycled nylon and 18% Lycra® spandex, while the lining is made of 90% recycled nylon and 10% Lycra® spandex.
    Predicted Answer: The Refresh Swimwear V-Neck Tankini Contrasts is made of 82% recycled nylon with 18% Lycra® spandex for the body and 90% recycled nylon with 10% Lycra® spandex for the lining.
    Predicted Grade: CORRECT
    
    Example 6:
    Question: What is the fabric composition of the EcoFlex 3L Storm Pants?
    Real Answer: The EcoFlex 3L Storm Pants are made of 100% nylon, exclusive of trim.
    Predicted Answer: The fabric composition of the EcoFlex 3L Storm Pants is 100% nylon, exclusive of trim.
    Predicted Grade: CORRECT
    



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
