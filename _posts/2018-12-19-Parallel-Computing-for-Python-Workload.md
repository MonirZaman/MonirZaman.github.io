## Parallel computation
Moder day's computer processor comes with multiple cores. Utilizing different cores often vastly reduces runtime of programs. This is helpful in the context where program manipulates large of amount of data. This tutorial will list out some ways to enable parallelization of Python code involving Pandas data frame.

## Partition a Pandas Data Frame
One technique that enables parallelization is to divide input data into partitions or batches. Then processing can be done in parallel on each partition.

Here input data frame is divided into 100 partitions.
```python
NUM_PARTITIONS = 100
def data_provider(self, df):
    for pi in range(NUM_PARTITIONS):
        yield df.loc[df.index.values % NUM_PARTITIONS == pi]
```
These partitions can be processed in parallel. Python's Multiprocessing Module offers easy to use interfaces for parallel execution and reducing different partitions' results. A simple process is defined that performs average operation on each item in the data frame.

```python
def process (self, batch_df, res_queue):
    for i, id in enumerate(batch_df[ID].unique()):
        a_df = batch_df[ batch_df[ID] == id]
        res_queue.put({id: a_df[VALUE].mean()})
```

Finally, process can be executed in different CPU cores in parallel.
```python
import multiprocessing
poolSize = multiprocessing.cpu_count()
my_pool = multiprocessing.Pool(processes=poolSize)

manager = multiprocessing.Manager()
res_queue = manager.Queue()

for a_df in self.data_provider(df):
  my_pool.apply_async(process, (a_df, res_queue))

my_pool.close()
my_pool.join()
```

## Dask Data Frame
Dask API offers a logical dataframe for processing large input file. It offers the same functionality as a Pandas data frame do. In Data science workflow, such data frame can greatly reduce run-time of data preprocessing.
```python
import dask.dataframe as dd
df = dd.read_csv('records.csv')
df.groupby([ID, NAME]).aggregate(['sum', 'mean', 'max', 'min'])
df.join(df, on=[MANAGER_ID, ID])
```
## References:  
* [Working with Big datasets](https://www.kaggle.com/yuliagm/how-to-work-with-big-datasets-on-16g-ram-dask)
* [Python and Dask](https://towardsdatascience.com/trying-out-dask-dataframes-in-python-for-fast-data-analysis-in-parallel-aa960c18a915)
