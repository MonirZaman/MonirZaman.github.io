<script type="text/javascript" async
  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML">
</script>

## [Meta-Learning Representations for Continual Learning](https://arxiv.org/pdf/1905.12588.pdf)

``
Javed, Khurram, and Martha White. "Meta-learning representations for continual learning." Advances in Neural Information Processing Systems. 2019.
``

Authors propose to address catastrophic forgetting when learning multiple tasks. Tasks interfere with each other.
When such forgetting appear
1. Correlated inputs  
2. Dense input  
3. Global and greedy update

They propose to create task representation, called RLN. They propose a 
separate prediction model, called PLN. These two steps in combination constitute a learning model that is able to generalize over multiple tasks. RLN is fixed once representation is learned. Only PLN network is updated when continual learning starts.
![network](/images/rln-pln.png)

The authors train these two networks with the objective of reducing interference among tasks. They select a set of correlated samples and a set of random samples. Networks trained on the correlated samples should provide similar performance on the random subset of samples. Loss function measures the performance degrade on the random samples. 
![meta-learning-update](/images/meta-learning-update.png)

The image above shows one update in the meta learning. RLN is initialized with $$\theta_{1}$$ and PLN with $$W_{1}$$. Through gradient descend, PLN is updated k times where k is the number of samples. Then a random subset of samples are drawn and loss is calculated on the random subsets based on the network's prediction. Gradient descend is calculated on the initial parameters $$\theta_{1}$$ and $$W_{1}$$ which are then updated. Similar meta learning steps are repeated many times.



