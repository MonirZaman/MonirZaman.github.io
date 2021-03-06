**Can we reproduce an ML model's validation loss across two training runs?**

We can reproduce validation loss on CPU given seed is set and no parallel training is used. [Keras documentation](https://keras.io/getting-started/faq/#how-can-i-obtain-reproducible-results-using-keras-during-development)
Reproducing model prediction requires [Test-time dropout method](https://tensorchiefs.github.io/bbs/files/dropouts-brownbag.pdf). This post will focus on reproducing validation loss.

#### Source of randomness:  
* Random number generator
* Parallel execution
* Non-convex loss surface

#### Parallel execution
- Certain operations in Tensorflow cannot reproduce results across run on GPU. This is due to limited precision of floats, adding a sequence of numbers may give different results based on the order they were in parallel execution. Even if you avoid non-deterministic operation such as tf.reduce_sum, tensorflow can introduce non-determinism when it calculates gradient

- Output is not consistent in the least significant bit  
  
- Nvidia's CuDNN library do not gurrantee reproduceability across runs on GPU [for certain convolution operations](https://docs.nvidia.com/deeplearning/sdk/cudnn-developer-guide/index.html#reproducibility)
 
```
 CUDA_VISIBLE_DEVICES="" python your_program.py
```

#### Tensorflow's reproducibility

```python
import numpy as np
import tensorflow as tf
import random as rn

# Seed for various random number generator

SEED=0

# Numpy fixed random seed
np.random.seed(SEED)

# Python's random generator
rn.seed(SEED)

# Set Tensorflow random seed
tf.set_random_seed(1234)

"""
Tensorflow by default use one thread per CPU core(multiple threads might give you different results)  

intra_op_parallelism_threads: Num of threads to execute an operation
inter_op_parallelism_threads: Num of threads to execute independent ops
"""
session_conf = tf.ConfigProto(intra_op_parallelism_threads=1,
                              inter_op_parallelism_threads=1)

from keras import backend as K

# Create default graph without parallelism
K.set_session(tf.Session(graph=tf.get_default_graph(), config=session_conf))
```

#### Pytorch's reproducibility  

For pytorch, set seed for torch and torch.cuda:  
```python  
random.seed(SEED)  
np.random.seed(SEED)  
torch.manual_seed(SEED)   
if torch.cuda.is_available:
  torch.cuda.manual_seed(SEED)
  torch.cuda.manual_seed_all(SEED)
  torch.backends.cudnn.deterministic = True
  torch.backends.cudnn.benchmark = False

```
For more details on Pytorch's reproducibility, take a look [here](https://pytorch.org/docs/stable/notes/randomness.html).  

#### Additional steps:  

* If PYTHONHASHSEED is not set or set to random, a random value is used to seed the hashes of str and bytes objects.  
```
 CUDA_VISIBLE_DEVICES="" PYTHONHASHSEED=0 python your_program.py
```

* Run on CPU
* Set seed for data sampler; Batches should be iterated in the same order 
* Run for few iterations on few records

#### Reference
[Determined AI's blog](https://determined.ai/blog/reproducibility-in-ml/)  
[Reproducibility class](https://drive.google.com/file/d/1spuQo08_qnq0To-bRIkUFQfu3VhhV4Ww/view)
